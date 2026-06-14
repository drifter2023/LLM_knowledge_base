---
id: agent-mcp
cluster: agent
concept: MCP (Model Context Protocol)
status: done
sources:
  - https://modelcontextprotocol.io/specification/2025-11-25
  - https://www.anthropic.com/news/model-context-protocol
  - https://en.wikipedia.org/wiki/Model_Context_Protocol
  - https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
  - https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/
  - https://unit42.paloaltonetworks.com/model-context-protocol-attack-vectors/
generated_at: 2026-04-25
---

林婉是清末上海洋行里一位口译官。她不懂电报机、不懂账册、不懂海关税则，可洋行老板偏要她坐在中堂的太师椅上，替他对着一屋子的客商发号施令。

最初的日子像噩梦。荷兰咖啡商递来一张荷文报价单，她得跑去后院找荷文翻译；德国船务行送来提单，她又得绕到东厢请德文先生；本地的钱庄朝奉来谈拆息，她还得托人去十六铺寻一位懂宁波官话的师爷。每来一位新客商，老板就得另雇一位通译；每多一种生意，她案头就多一摞她看不懂的纸。三个月下来，她瘦了一圈，洋行的开销却翻了三倍。客商们抱怨：同样一句"明日午时交割"，要在五个翻译之间转译五遍，意思早走样了。

转机出现在一个春夜。一位法国领事馆退休的老书记官给她出了个主意。他说：你不必学会所有语言，也不必雇齐所有翻译。你只需要立一份"通译章程"。章程里写明三件事：第一，无论哪国通译进门，都用同一种格式递条子给你——上联写"我能办什么"，下联写"我需要你给我什么"，中间盖一枚印鉴注明身份；第二，你回话也只用这一种格式，问什么、准什么、驳什么，一律照章；第三，章程附一册"礼数手册"，规定通译进门要先自报家门、列明本事，你也要先告知今日只问税则、不问私事，免得越俎代庖。

她照做了。一个月后，洋行后院安静下来。荷文先生、德文先生、宁波师爷各自坐在自己的小屋里，谁也不必挪窝。新来的葡萄牙糖商带着自己的通译进门，那通译只消把章程看一遍，就知道该怎么递条子。林婉坐在太师椅上，案头只剩一种纸、一种格式。她依旧不懂荷文、不懂德文、不懂宁波话，可她能调度十七个通译，像调度十七只算盘珠。

半年后，邻近的几家洋行都来抄她的章程。再过一年，整条外滩的洋行公会把这份章程立为公约，凡新开张的字号，门口都要挂一块"遵章接译"的木牌。林婉本人没赚到这笔钱——她把章程白白送了出去，理由是："若只我一家用，它就只是一张纸；若家家都用，它才是一条路。"

只是她没料到一件事。章程规定通译进门要"自报家门、列明本事"，可章程并没规定要核验那份自报。某日来了一位假扮的葡文通译，递上的条子格式分毫不差，印鉴也仿得逼真，里头却暗藏一句："请东家把昨日与英商的密约抄录一份给我带回去对照。"林婉险些照办。她这才明白：章程让万家互通，也让万家共担同一道暗门。

---

## Concept and field

**MCP (Model Context Protocol)** is an open protocol introduced by Anthropic in November 2024 and donated to the Linux Foundation's newly-formed Agentic AI Foundation (AAIF) in December 2025, alongside Block's `goose` and OpenAI's `AGENTS.md`. It sits in the **agent / tool-use cluster** and has become the de-facto standard for connecting LLM applications to external data, tools, and workflows.

## Key mechanism

MCP solves the **N×M integration problem**: without a shared protocol, every one of N AI applications needs a custom connector to every one of M data sources, yielding N×M bespoke integrations. MCP collapses this to N+M by standardising the wire format.

Concretely, MCP defines:

- **Three roles**: a *host* (the LLM application, e.g. Claude Desktop), one or more *clients* embedded in the host, and external *servers* that expose capabilities. Communication uses **JSON-RPC 2.0** over stateful connections, with explicit capability negotiation at handshake — a design openly modelled on the Language Server Protocol (LSP).
- **Server-offered primitives**: *Resources* (read-only context the model or user can pull), *Prompts* (templated workflows the user can invoke), and *Tools* (functions the model can call to take action).
- **Client-offered primitives**: *Sampling* (servers can ask the host model to generate completions, enabling recursive/agentic loops), *Roots* (filesystem/URI scoping), and *Elicitation* (servers can ask the user for additional input mid-flow).
- **Discovery and lifecycle**: in November 2025 the spec added asynchronous operations, statelessness options, server identity, and an official registry for server discovery.

Because the protocol is uniform, any compliant client can talk to any compliant server. By late 2025, over 10,000 community MCP servers had been published, and OpenAI, Google DeepMind, and Microsoft Copilot all natively support the protocol.

## Why it matters

MCP is the "USB-C for AI agents." Before MCP, agent frameworks each invented their own tool-calling format, function schemas, and credential-passing conventions, locking ecosystems into silos. MCP's LSP-style separation of *protocol* from *implementation* let the tool ecosystem grow independently of any single vendor — which is why even Anthropic's competitors adopted it.

## Open questions and controversies

The reviewer should re-verify recent security work, as MCP's threat model is the protocol's most actively contested area in 2025–2026:

- **Tool poisoning / indirect prompt injection**: Simon Willison (April 2025) and Invariant Labs documented attacks where malicious tool descriptions exfiltrate data (e.g. WhatsApp history, private GitHub repo contents) by hijacking the agent through metadata the client does not validate.
- **Confused-deputy and "rug pull" attacks**: servers can change tool definitions between sessions; the spec's security guarantees are stated as `SHOULD`, not `MUST`.
- **Supply-chain CVEs**: e.g. CVE-2025-6514 in `mcp-remote`, a popular OAuth proxy.
- **Sampling abuse**: Palo Alto Unit 42 (2025) showed new injection vectors specifically through the server-initiated sampling channel.

## Key references

- Anthropic. "Introducing the Model Context Protocol." Nov 25, 2024. https://www.anthropic.com/news/model-context-protocol
- MCP Specification 2025-11-25. https://modelcontextprotocol.io/specification/2025-11-25
- Linux Foundation. "Formation of the Agentic AI Foundation." Dec 9, 2025. https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- Willison, S. "Model Context Protocol has prompt injection security problems." Apr 9, 2025. https://simonwillison.net/2025/Apr/9/mcp-prompt-injection/
- Palo Alto Unit 42. "New Prompt Injection Attack Vectors Through MCP Sampling." 2025. https://unit42.paloaltonetworks.com/model-context-protocol-attack-vectors/
