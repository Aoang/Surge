import type { Config, Policy, Preset, RuleType } from './config'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { blockers, createConfig, generateConfig, parseNodes, ruleTypes, services, validateConfig } from './config'
import './style.css'

const presets: { id: Preset, name: string, label: string, description: string, icon: string }[] = [
  { id: 'balanced', name: '日常分流', label: '推荐', description: '国内与 Apple 直连，Telegram、下载等服务走代理。', icon: '◈' },
  { id: 'proxy', name: '代理优先', label: '海外服务', description: '除局域网与下载器进程外，默认使用代理出口。', icon: '↗' },
  { id: 'direct', name: '直连净化', label: '无需节点', description: '所有请求直连，只保留广告与无效响应拦截。', icon: '◇' },
]
const policyLabels: Record<string, string> = { DIRECT: '直连', Proxy: '代理', REJECT: '拦截', OFF: '不单独分流' }

function App() {
  const [config, setConfig] = useState(createConfig)
  const [custom, setCustom] = useState(false)
  const [notice, setNotice] = useState('')
  const [nextId, setNextId] = useState(1)
  const errors = validateConfig(config)
  const output = errors.length ? '' : generateConfig(config)
  const nodeNames = parseNodes(config.source === 'nodes' ? config.nodes : '').names
  const policies = ['DIRECT', 'Proxy', 'REJECT', ...nodeNames]
  const ruleCount = output.split('\n').filter(line => /^(?:RULE-SET|DOMAIN-SET|DOMAIN|IP-CIDR|PROCESS-NAME|FINAL|GEOIP)/.test(line)).length

  function update<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig(previous => ({ ...previous, [key]: value }))
    setNotice('')
  }
  function customize<K extends keyof Config>(key: K, value: Config[K]) {
    update(key, value)
    setCustom(true)
  }
  function applyPreset(preset: Preset) {
    setConfig(previous => ({
      ...createConfig(preset),
      platform: previous.platform,
      source: previous.source,
      subscription: previous.subscription,
      nodes: previous.nodes,
      dns: previous.dns,
      ipv6: previous.ipv6,
      selection: previous.selection,
    }))
    setCustom(false)
    setNotice('')
  }
  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `Surge-${config.platform === 'mac' ? 'macOS' : 'iOS'}.conf`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('已下载。在 Surge 中导入配置文件，切换到规则模式。')
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output)
      setNotice('配置已复制。')
    }
    catch { setNotice('复制失败，请下载配置文件。') }
  }
  function policySelect(value: Policy, onChange: (value: Policy) => void, label: string, off = false) {
    return (
      <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>
        {off && <option value="OFF">不单独分流</option>}
        {policies.map(policy => <option key={policy} value={policy}>{policyLabels[policy] ?? policy}</option>)}
      </select>
    )
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-mark">S</span>
          {' '}
          Surge
          {' '}
          <span className="brand-sub">配置工坊</span>
        </a>
        <div className="top-links">
          <span className="local-badge">
            <i />
            {' '}
            浏览器本地生成
          </span>
          <a href="https://github.com/aoang/surge" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <div className="nav-label">CONFIGURATION</div>
          <nav aria-label="配置步骤">
            <a href="#plan">
              <span>01</span>
              选择方案
            </a>
            <a href="#connection">
              <span>02</span>
              代理与网络
            </a>
            <a href="#routing">
              <span>03</span>
              分流与拦截
            </a>
            <a href="#export">
              <span>04</span>
              预览与导出
            </a>
          </nav>
          <div className="sidebar-note">
            <span>从规则，到配置。</span>
            <p>为自己的网络选择合适的出口，让每一条规则都有明确的去向。</p>
            <a href="https://manual.nssurge.com/" target="_blank" rel="noreferrer">Surge 官方手册 ↗</a>
          </div>
          <div className="sidebar-footer">
            SURGE RULES
            <span> / </span>
            {' '}
            OPEN SOURCE
          </div>
        </aside>
        <main>
          <div className="intro">
            <div className="eyebrow">YOUR NETWORK, YOUR RULES</div>
            <h1>
              让网络，按你的方式连接
              <span>。</span>
            </h1>
            <p>从一份推荐方案开始，按需调整分流。生成可以直接导入 Surge 的配置文件。</p>
          </div>
          <div className="workspace">
            <div className="editor">
              <section id="plan" className="section">
                <div className="section-heading">
                  <div>
                    <span className="step">01</span>
                    <h2>选择你的起点</h2>
                  </div>
                  <button type="button" className={`tag ${custom ? 'custom-active' : ''}`} aria-pressed={custom} onClick={() => setCustom(true)}>自定义配置</button>
                </div>
                <div className="preset-grid">
                  {presets.map(preset => (
                    <button type="button" key={preset.id} className={`preset ${config.preset === preset.id && !custom ? 'selected' : ''}`} onClick={() => applyPreset(preset.id)} aria-pressed={config.preset === preset.id && !custom}>
                      <div className="preset-top">
                        <span className="preset-icon">{preset.icon}</span>
                        <span className="preset-label">{preset.label}</span>
                      </div>
                      <strong>{preset.name}</strong>
                      <p>{preset.description}</p>
                      <span className="preset-check">{config.preset === preset.id && !custom ? '● 已选择' : '○ 选择方案'}</span>
                    </button>
                  ))}
                </div>
                <p className="hint">调整下方选项即进入自定义模式。重新选择方案会重置分流、拦截和自定义规则，保留节点与网络设置。</p>
                <div className="platform-row">
                  <span>使用平台</span>
                  <div className="segmented" role="group" aria-label="使用平台">
                    <button type="button" className={config.platform === 'mac' ? 'active' : ''} aria-pressed={config.platform === 'mac'} onClick={() => update('platform', 'mac')}>macOS</button>
                    <button type="button" className={config.platform === 'ios' ? 'active' : ''} aria-pressed={config.platform === 'ios'} onClick={() => update('platform', 'ios')}>iOS</button>
                  </div>
                </div>
              </section>
              <section id="connection" className="section">
                <div className="section-heading">
                  <div>
                    <span className="step">02</span>
                    <h2>连接你的代理</h2>
                  </div>
                  <span className="muted">自备节点</span>
                </div>
                <div className="source-tabs" role="group" aria-label="节点来源">
                  <button type="button" className={config.source === 'subscription' ? 'active' : ''} aria-pressed={config.source === 'subscription'} onClick={() => update('source', 'subscription')}>订阅地址</button>
                  <button type="button" className={config.source === 'nodes' ? 'active' : ''} aria-pressed={config.source === 'nodes'} onClick={() => update('source', 'nodes')}>手动填写节点</button>
                </div>
                {config.source === 'subscription'
                  ? (
                      <label className="field">
                        Surge 订阅地址
                        <input type="url" autoComplete="off" spellCheck={false} value={config.subscription} placeholder="https://example.com/surge?token=…" onChange={event => update('subscription', event.target.value)} />
                        <span className="hint">支持 Surge 配置或 [Proxy] 格式的节点列表；不支持直接导入 Clash / Base64 订阅。面板不会请求此地址，Surge 导入后会获取节点。</span>
                      </label>
                    )
                  : (
                      <label className="field">
                        Surge 节点配置
                        <textarea rows={4} autoComplete="off" spellCheck={false} value={config.nodes} placeholder={'香港节点 = trojan, hk.example.com, 443, password=你的密码\n日本节点 = snell, jp.example.com, 443, psk=你的密钥, version=4'} onChange={event => update('nodes', event.target.value)} />
                        <span className="hint">每行一个节点，不含 [Proxy] 标题。支持常见 HTTP、SOCKS5、SS、Trojan、Snell 等；节点的协议参数请按官方文档填写。</span>
                      </label>
                    )}
                <div className="two-columns">
                  <label className="field">
                    代理选择方式
                    <select value={config.selection} onChange={event => update('selection', event.target.value as Config['selection'])}>
                      <option value="select">手动选择 · 更稳定的出口</option>
                      <option value="url-test">自动测速 · 优先低延迟</option>
                    </select>
                  </label>
                  <label className="field">
                    未匹配流量的出口
                    {policySelect(config.finalPolicy, value => customize('finalPolicy', value), '未匹配流量的出口')}
                  </label>
                </div>
                <details className="network">
                  <summary>
                    网络设置
                    <span>DNS / IPv6</span>
                  </summary>
                  <label className="field">
                    DNS 服务器
                    <input value={config.dns} spellCheck={false} onChange={event => update('dns', event.target.value)} />
                    <span className="hint">用英文逗号分隔；system 使用当前网络的 DNS。公共 DNS 可能不支持公司内网域名。</span>
                  </label>
                  <label className="toggle-row">
                    <span>
                      <strong>允许 IPv6</strong>
                      <small>VIF 随本地网络自动启用 IPv6。</small>
                    </span>
                    <input type="checkbox" role="switch" checked={config.ipv6} onChange={event => update('ipv6', event.target.checked)} />
                  </label>
                </details>
                <div className="privacy-note">⌁ 订阅和密码仅在当前页面内存中处理，不上传、不保存。导出文件包含这些信息，请妥善保管。</div>
              </section>
              <section id="routing" className="section">
                <div className="section-heading">
                  <div>
                    <span className="step">03</span>
                    <h2>给流量安排去向</h2>
                  </div>
                  <span className="muted">按顺序匹配</span>
                </div>
                <div className="subheading">
                  服务分流
                  <span>代理服务会生成可在 Surge 中切换的独立策略组</span>
                </div>
                <div className="service-list">
                  {services.map(service => (
                    <div className="service-row" key={service.id}>
                      <div>
                        <strong>{service.name}</strong>
                        <p>{service.description}</p>
                      </div>
                      {policySelect(config.servicePolicies[service.id] ?? 'OFF', value => customize('servicePolicies', { ...config.servicePolicies, [service.id]: value }), `${service.name}策略`, true)}
                    </div>
                  ))}
                </div>
                <div className="subheading">基础分流</div>
                <label className="toggle-row">
                  <span>
                    <strong>国内 IP 直连</strong>
                    <small>中国大陆网段与 GEOIP CN，放在服务分流之后。</small>
                  </span>
                  <input type="checkbox" role="switch" checked={config.chinaDirect} onChange={event => customize('chinaDirect', event.target.checked)} />
                </label>
                <label className="toggle-row">
                  <span>
                    <strong>下载器与隧道进程直连</strong>
                    <small>{config.platform === 'mac' ? 'BT 下载器、Tailscale、Cloudflare Tunnel 等；优先于服务分流。' : '仅 macOS 支持，iOS 配置中不会生成此项。'}</small>
                  </span>
                  <input type="checkbox" role="switch" disabled={config.platform !== 'mac'} checked={config.platform === 'mac' && config.processDirect} onChange={event => customize('processDirect', event.target.checked)} />
                </label>
                <div className="subheading">
                  广告与无效响应拦截
                  <span>不需要安装证书</span>
                </div>
                {blockers.map(blocker => (
                  <label className="toggle-row" key={blocker.id}>
                    <span>
                      <strong>{blocker.name}</strong>
                      <small>{blocker.description}</small>
                    </span>
                    <input type="checkbox" role="switch" checked={config.blocks.includes(blocker.id)} onChange={event => customize('blocks', event.target.checked ? [...config.blocks, blocker.id] : config.blocks.filter(id => id !== blocker.id))} />
                  </label>
                ))}
                <div className="custom-heading">
                  <div className="subheading">
                    自定义规则
                    <span>最高优先级，按添加顺序匹配</span>
                  </div>
                  <button type="button" className="text-button" onClick={() => { customize('customRules', [...config.customRules, { id: nextId, type: 'DOMAIN-SUFFIX', value: '', policy: 'DIRECT' }]); setNextId(nextId + 1) }}>＋ 添加规则</button>
                </div>
                {config.customRules.length === 0 && <div className="empty-rules">需要放行被误拦截的域名？添加一条直连规则即可。</div>}
                {config.customRules.map((rule, index) => (
                  <div className="custom-rule" key={rule.id}>
                    <span className="rule-index">{index + 1}</span>
                    <select aria-label={`规则 ${index + 1} 类型`} value={rule.type} onChange={event => customize('customRules', config.customRules.map(item => item.id === rule.id ? { ...item, type: event.target.value as RuleType } : item))}>{ruleTypes.map(type => <option key={type} disabled={config.platform === 'ios' && type === 'PROCESS-NAME'}>{type}</option>)}</select>
                    <input aria-label={`规则 ${index + 1} 内容`} placeholder={rule.type.startsWith('IP-CIDR') ? '192.168.0.0/16' : 'example.com'} value={rule.value} onChange={event => customize('customRules', config.customRules.map(item => item.id === rule.id ? { ...item, value: event.target.value } : item))} />
                    {policySelect(rule.policy, value => customize('customRules', config.customRules.map(item => item.id === rule.id ? { ...item, policy: value } : item)), `规则 ${index + 1} 策略`)}
                    <button type="button" className="remove-rule" aria-label={`删除规则 ${index + 1}`} onClick={() => customize('customRules', config.customRules.filter(item => item.id !== rule.id))}>×</button>
                  </div>
                ))}
                <details className="help">
                  <summary>规则如何生效？</summary>
                  <p>Surge 从上到下匹配，第一条命中的规则决定出口。这里的顺序为：自定义 → 局域网 → 拦截 → macOS 进程 → 服务 → 国内 IP → FINAL。选择“不单独分流”后，该服务会继续匹配后面的规则。</p>
                  <p>国内 IP 规则允许 DNS 解析；Cloudflare 与自定义 IP 网段使用 no-resolve，不会为匹配主动解析域名。自定义规则优先于局域网与拦截，请注意覆盖范围。</p>
                  <a href="https://manual.nssurge.com/rules/overview.html" target="_blank" rel="noreferrer">了解 Surge 规则顺序 ↗</a>
                </details>
              </section>
              <section className="section aftercare">
                <h2>导入之后，最后两步</h2>
                <ol>
                  <li>
                    <span>1</span>
                    <div>
                      <strong>在 Surge 中导入 .conf 文件</strong>
                      <p>使用「规则模式」，等待远程节点和规则集下载完成。</p>
                    </div>
                  </li>
                  <li>
                    <span>2</span>
                    <div>
                      <strong>选择你的代理节点</strong>
                      <p>手动模式下，在 Proxy 策略组中选择节点；PayPal 等服务可单独固定出口。节点参数、订阅可用性仍需由 Surge 验证。</p>
                    </div>
                  </li>
                </ol>
                <details className="help">
                  <summary>需要额外模块？</summary>
                  <p>模块需在 Surge 的模块页面单独安装；它们会覆盖主配置，不写入本次导出的文件。</p>
                  <div className="module-links">
                    <a href="https://surge.x2ox.com/Modules/google_cn.sgmodule">Google.cn 重定向 ↗</a>
                    <a href="https://surge.x2ox.com/Modules/real_ip.sgmodule">绕过 FakeIP（macOS）↗</a>
                    <a href="https://surge.x2ox.com/Modules/hide_vpn_icon.sgmodule">隐藏 VPN 图标（iOS）↗</a>
                  </div>
                </details>
              </section>
            </div>
            <aside id="export" className="preview-panel" aria-label="配置预览">
              <div className="preview-header">
                <div>
                  <span className="live-dot" />
                  {' '}
                  实时预览
                </div>
                <span>.conf</span>
              </div>
              <div className="preview-meta">
                <strong>
                  Surge-
                  {config.platform === 'mac' ? 'macOS' : 'iOS'}
                  .conf
                </strong>
                <span>{output ? `${ruleCount} 条规则 · UTF-8` : '等待完成配置'}</span>
              </div>
              {errors.length > 0
                ? (
                    <div className="preview-placeholder">
                      <span className="placeholder-icon">⌘</span>
                      <h3>差一步，就能连接。</h3>
                      <p>完成以下设置后，即可预览完整配置。</p>
                      <ul>{errors.map(error => <li key={error}>{error}</li>)}</ul>
                    </div>
                  )
                : (
                    <div className="code-preview" tabIndex={0} aria-label="生成的 Surge 配置">
                      {output.split('\n').map((line, index) => (
                        <div className={`code-line ${line.startsWith('#') ? 'comment' : line.startsWith('[') ? 'code-section' : ''}`} key={`${index}-${line}`}>
                          <span className="line-number">{index + 1}</span>
                          <code>{line || ' '}</code>
                        </div>
                      ))}
                    </div>
                  )}
              <div className="export-actions">
                <button type="button" className="download-button" disabled={!output} onClick={download}>↓ 下载配置文件</button>
                <button type="button" className="copy-button" disabled={!output} onClick={() => { void copy() }}>复制</button>
              </div>
              <div className="export-note" role="status" aria-live="polite">{notice || '每次调整都会更新配置，导出前无需额外保存。'}</div>
              <div className="preview-flow">
                <span>规则的去向</span>
                <div>
                  <i />
                  {' '}
                  自定义覆盖
                  {' '}
                  <b>↓</b>
                  {' '}
                  拦截与服务分流
                  {' '}
                  <b>↓</b>
                  {' '}
                  {config.chinaDirect ? '国内直连 → ' : ''}
                  {policyLabels[config.finalPolicy] ?? config.finalPolicy}
                  兜底
                </div>
              </div>
            </aside>
          </div>
          <footer>
            基于 Surge 原生配置格式
            <span>·</span>
            {' '}
            规则由 surge.x2ox.com 提供
            <a href="https://github.com/aoang/surge#license" target="_blank" rel="noreferrer">开源许可 ↗</a>
          </footer>
        </main>
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
