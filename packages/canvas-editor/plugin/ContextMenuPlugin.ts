import { Plugin } from './createPlugin'
import ContextMenu, { type MenuOptions, type MenuItem } from '@imengyu/vue3-context-menu'
import type { Editor } from '../core'

interface MenuItemV2 extends MenuItem {
  hotkey: string
  key: string
  children?: MenuItemV2[]
}

type MenuType = 'group' | 'layer' | 'general'

interface ContextMenuPluginOptions<T = any, K = any> {
  supportMenu: MenuType[]
  context: T
  render: K
}

export class ContextMenuPlugin extends Plugin.BasePlugin {
  private _render?: any
  private _menuContext?: any
  get name() {
    return 'ContextMenuPlugin'
  }

  get events(): string[] {
    return []
  }

  get hotkeys(): string[] {
    return ['⌘+[', '⌘+]', '[', ']', '⌘+g', '⌘+⇧+g', '⌘+⇧+c', '⌘+c', 'backspace']
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
      '⌘+G': () => {
        GroupPlugin?.group()
      },
      '⌘+⇧+G': () => {
        GroupPlugin?.unGroup()
      },
      '⌘+⇧+H': () => {
        // 显示/隐藏
        AttrsEditPlugin?.setVisible()
      },
      '⌘+⇧+L': () => {
        // 锁定/解锁
        AttrsEditPlugin?.setLock()
      },
      '⌘+⇧+C': () => {
        CopyPlugin?.copyText().then(() => {
          console.warn('已复制到剪贴板！')
        })
      },
      '⌘+C': () => {
        CopyPlugin?.clone()
      },
      'backspace': () => {
        DeleteHotKeyPlugin?.del()
      },
    }
  }

  constructor(canvas: fabric.Canvas, editor: Editor, options: Plugin.Options & ContextMenuPluginOptions) {
    super(canvas, editor, options)
    // 初始化
    this.init(options.context, options.render)
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
    return this._render('div', { class: 'flex menu-item', style: 'min-width: 150px' }, [
      this._render('div', { style: 'color: #c3c3c4; font-size: 15px;' }, label),
      this._render('div', { style: 'color: #c3c3c4; font-size: 12px;' }, hotkey),
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
        hotkey: '⌘+G',
        key: 'group',
        disabled: !this._getCurtarget(),
        divided: false,
        onClick: () => {
          this.callApi('⌘+G')
        },
      },
      {
        label: '拆分',
        hotkey: '⌘+⇧+G',
        key: 'group',
        divided: true,
        disabled: this._getCurtarget()?.type !== 'group',
        onClick: () => {
          this.callApi('⌘+⇧+G')
        },
      },
      {
        label: '复制ID',
        hotkey: '⌘+⇧+C',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+⇧+C')
        },
      },
      {
        label: '显示/隐藏',
        hotkey: '⌘+⇧+H',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+⇧+H')
        },
      },
      {
        label: '锁定/解锁',
        hotkey: '⌘+⇧+L',
        key: 'general',
        disabled: !this._getCurtarget(),
        divided: true,
        onClick: () => {
          this.callApi('⌘+⇧+L')
        },
      },
      {
        label: '克隆',
        hotkey: '⌘+C',
        key: 'general',
        divided: false,
        disabled: !this._getCurtarget(),
        onClick: () => {
          this.callApi('⌘+C')
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
    return this.apis[type].call(this)
  }

  init(context: any, render: any) {
    this._render = render
    this._menuContext = context
  }

  /**
   * 展示菜单
   * @param event
   * @param options
   */
  showMenu(event: fabric.IEvent<MouseEvent>, options: MenuOptions = { x: 0, y: 0 }) {
    // 阻止事件
    event.e.preventDefault()


    // 展示右键菜单
    this._menuContext?.showContextMenu({
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
      zIndex: 3,
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
