import { h } from 'vue'
import { type Editor, Plugin } from '@tm2js/canvas-editor'
import ContextMenu, { type MenuOptions, type MenuItem } from '@imengyu/vue3-context-menu'

interface MenuItemV2 extends MenuItem {
  hotkey: string
  key: string
  children?: MenuItemV2[]
}

type MenuType = 'group' | 'layer' | 'general'

export interface ContextMenuPluginOptions {
  supportMenu: MenuType[]
}

export class ContextMenuPlugin extends Plugin.BasePlugin {
  get name() {
    return 'ContextMenuPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return ['⌘+[', '⌘+]', '[', ']', '⌘+g', '⌘+⇧+g', '⌘+⇧+c', '⌘+b', 'backspace']
  }

  get apis() {
    const CopyPlugin = this._editor.getPlugin('CopyPlugin')
    const LayerPlugin = this._editor.getPlugin('LayerPlugin')
    const GroupPlugin = this._editor.getPlugin('GroupPlugin')
    const AttrsEditPlugin = this._editor.getPlugin('AttrsEditPlugin')
    const DeleteHotKeyPlugin = this._editor.getPlugin('DeleteHotKeyPlugin')
    return {
      '⌘+[': () => {
        LayerPlugin?.downTop()
      },
      '⌘+]': () => {
        LayerPlugin?.upTop()
      },
      '[': () => {
        LayerPlugin?.down()
      },
      ']': () => {
        LayerPlugin?.up()
      },
      '⌘+g': () => {
        GroupPlugin?.group()
      },
      '⌘+⇧+g': () => {
        GroupPlugin?.unGroup()
      },
      '⌘+⇧+h': () => {
        // 显示/隐藏
        AttrsEditPlugin?.setVisible()
      },
      '⌘+⇧+l': () => {
        // 锁定/解锁
        AttrsEditPlugin?.setLock()
      },
      '⌘+⇧+c': () => {
        CopyPlugin?.copyText().then(() => {
          console.warn('已复制到剪贴板！')
        })
      },
      '⌘+b': () => {
        CopyPlugin?.clone()
      },
      'backspace': () => {
        DeleteHotKeyPlugin?.del()
      },
    }
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options) {
    super(canvas, editor, options)
  }

  /**
   * 获取当前选中元素
   * @returns fabric.Object
   */
  private _getCurtarget() {
    return this._canvas.getActiveObject()
  }

  /**
   * 渲染 label
   * @param label
   * @param hotkey
   * @returns h
   */
  private renderLabel(label: string, hotkey: string) {
    return h('div', { class: 'menu-item', style: 'display: flex; min-width: 150px' }, [
      h('div', { style: 'color: #333; font-size: 15px;' }, label),
      h('div', { style: 'color: #333; font-size: 12px;' }, hotkey),
    ])
  }

  get _menus(): MenuItemV2[] {
    return [
      {
        label: '图层管理',
        disabled: !this._getCurtarget(),
        key: 'layer',
        children: [
          {
            label: '向上一层',
            hotkey: ']',
            key: 'layer',
            onClick: () => {
              this.callApi(']')
            },
          },
          {
            label: '向下一层',
            hotkey: '[',
            key: 'layer',
            onClick: () => {
              this.callApi('[')
            },
          },
          {
            label: '移动到顶层',
            hotkey: '⌘+]',
            key: 'layer',
            onClick: () => {
              this.callApi('⌘+]')
            },
          },
          {
            label: '移动到底层',
            hotkey: '⌘+[',
            key: 'layer',
            onClick: () => {
              this.callApi('⌘+[')
            },
          },
        ],
        hotkey: '',
        divided: true,
      },
      {
        label: '组合',
        hotkey: '⌘+g',
        key: 'group',
        disabled: !this._getCurtarget(),
        divided: false,
        onClick: () => {
          this.callApi('⌘+g')
        },
      },
      {
        label: '拆分',
        hotkey: '⌘+⇧+g',
        key: 'group',
        divided: true,
        disabled: this._getCurtarget()?.type !== 'group',
        onClick: () => {
          this.callApi('⌘+⇧+g')
        },
      },
      {
        label: '复制ID',
        hotkey: '⌘+⇧+c',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+⇧+c')
        },
      },
      {
        label: '显示/隐藏',
        hotkey: '⌘+⇧+h',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+⇧+h')
        },
      },
      {
        label: '锁定/解锁',
        hotkey: '⌘+⇧+l',
        key: 'general',
        disabled: !this._getCurtarget(),
        divided: true,
        onClick: () => {
          this.callApi('⌘+⇧+l')
        },
      },
      {
        label: '克隆',
        hotkey: '⌘+b',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+b')
        },
      },
      {
        label: '删除',
        hotkey: 'backspace',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('backspace')
        },
      },
    ].filter((item) => {
      if (!this._options.supportMenu)
        return item
      else if (this._options.supportMenu.includes(item.key)) {
        return item
      }
    })
  }

  hotkeyEvent(eventName: keyof typeof this.apis, event: KeyboardEvent) {
    event.preventDefault()
    event.type === 'keydown' && this.callApi(eventName)
  }

  callApi(type: keyof typeof this.apis) {
    return this.apis[type] && this.apis[type].call(this)
  }

  /**
   * 展示菜单
   * @param event
   * @param options
   */
  showMenu(event: fabric.IEvent<MouseEvent>, options: MenuOptions = { x: 0, y: 0 }) {
    // 先关闭再打开
    this.hideMenu(event)
    event.e.preventDefault()
    // 阻止事件
    if (!event.target)
      return
    if (event.target.id === 'workspace') return
    this._canvas.setActiveObject(event.target)
    // 展示右键菜单
    ContextMenu?.showContextMenu({
      // 配置项
      ...options,
      // 重置配置项
      x: event.e.x,
      y: event.e.y,
      items: this._menus.map((item) => {
        item.label = this.renderLabel(item.label as string, item.hotkey)
        item.children = item.children?.map((sub) => {
          sub.label = this.renderLabel(sub.label as string, sub.hotkey)
          return sub
        }) || []
        return item
      }),
      zIndex: 99999,
      minWidth: 200,
    })
  }

  /**
   * 关闭右键
   */
  hideMenu(event: fabric.IEvent<MouseEvent>) {
    event.e.preventDefault()
    ContextMenu.closeContextMenu()
  }
}
