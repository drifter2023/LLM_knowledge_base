/* ─────────────────────────────────────────────────────────────
   寓言集 · 原型演示数据
   12 个概念群（真实结构）+ 8 篇原创演示故事
   每篇含：中文寓言、先猜选项、桥接、中文分层速览、
           英文精读长文(essayEn)、参考文献(sources, 真实链接)
   故事正文与英文长文为本原型原创/演示之用。
   ───────────────────────────────────────────────────────────── */

const CLUSTERS = [
  { slug:'arch',      num:1,  zh:'架构与表征',       en:'Architecture & Representation', n:8,  pri:'P2' },
  { slug:'scaling',   num:2,  zh:'训练动力学与扩展', en:'Training Dynamics & Scaling',   n:7,  pri:'P2' },
  { slug:'icl',       num:3,  zh:'上下文学习',       en:'In-Context Learning',           n:8,  pri:'P3' },
  { slug:'align',     num:4,  zh:'后训练与对齐',     en:'Post-training & Alignment',     n:10, pri:'P1' },
  { slug:'itc',       num:5,  zh:'推理时计算',       en:'Inference-Time Compute',        n:7,  pri:'P0' },
  { slug:'interp',    num:6,  zh:'机制可解释性',     en:'Mech. Interpretability',        n:10, pri:'P1' },
  { slug:'longctx',   num:7,  zh:'长上下文与记忆',   en:'Long Context & Memory',         n:7,  pri:'P3' },
  { slug:'retrieval', num:8,  zh:'检索与外部知识',   en:'Retrieval',                     n:7,  pri:'P3' },
  { slug:'agent',     num:9,  zh:'Agent 系统',       en:'Agentic Systems',               n:8,  pri:'P0' },
  { slug:'safety',    num:10, zh:'安全与对齐',       en:'Safety & Alignment',            n:10, pri:'P0' },
  { slug:'eff',       num:11, zh:'效率与系统',       en:'Efficiency & Systems',          n:9,  pri:'P2' },
  { slug:'eval',      num:12, zh:'评估与基准',       en:'Evaluation & Benchmarks',       n:9,  pri:'P3' },
];

const PRI_COLOR = { P0:'var(--p0)', P1:'var(--p1)', P2:'var(--p2)', P3:'var(--p3)' };

/* 8 篇原创演示故事。pos = 在所属概念群中的序号（0 起） */
const STORIES = [
  {
    id:'align-sft', cluster:'align', pos:0, concept:'SFT', conceptZh:'监督微调', priority:'P1',
    parable:'书坊新来的学徒，师父不教他写信，只把一千封写得最得体的回信摊在案上，让他一笔一画地临摹。三月之后，还没人问过他懂不懂道理，他递出的信却已经像模像样——称谓、转折、落款，无一不妥。',
    guesses:[
      {label:'预训练 Pre-training'},
      {label:'监督微调 SFT', correct:true},
      {label:'人类反馈强化学习 RLHF'},
    ],
    bridge:'临摹一千封范本 = SFT：用人写好的「问题→理想回答」示范，先教会模型「一个助手该长什么样」，而不是讲道理。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'用人类写好的「问题→理想回答」示范来微调，教基础模型像助手一样应答。'},
      {pill:'机制', title:'关键机制', body:'在 (prompt, response) 对上继续做下一个词预测，但只对「回答」部分计算损失。数据少而精——通常几千到上百万条高质量示范。'},
      {pill:'为何重要', title:'为何重要', body:'预训练模型只会「续写」网页文本，不会「应答」。SFT 是最便宜、最稳定地装上对话接口的一步，也是后续 RLHF 的前置起跑线。'},
      {pill:'前沿', title:'争议与前沿', body:'2025 年「SFT 记忆、RL 泛化」一文指出：SFT 容易过拟合示范的「表面风格」，在分布外会掉点。新共识把它看作 RL 的起跑线，而非终点。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Supervised Fine-Tuning is the first stage of the modern post-training stack for large language models, sitting in the <em>alignment</em> cluster alongside RLHF, DPO, and RLVR. A pretrained base model — already rich with world knowledge from next-token prediction on web text — is further trained on a curated set of <span class="formula">(prompt, response)</span> pairs written or vetted by humans.</p>
<span class="label">Key mechanism</span>
<p>Concretely, SFT minimizes cross-entropy on the response tokens conditioned on the prompt: <span class="formula">L = −Σ log p_θ(y_t | x, y_&lt;t)</span>. Loss is typically masked so that only the assistant's response contributes gradients. The dataset is small relative to pretraining (10³–10⁶ examples) but high quality.</p>
<span class="label">Why it matters</span>
<p>Pretrained models are excellent next-token predictors but poor assistants — they continue text rather than respond to it. SFT is the cheapest, most stable way to install the <em>interface</em> of an assistant: turn-taking, instruction-following, the chat format, refusals, and tool-call syntax.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Chu et al.'s 2025 paper <em>"SFT Memorizes, RL Generalizes"</em> showed that SFT can improve in-distribution accuracy yet degrade out-of-distribution, while RL with outcome rewards generalizes — reframing SFT as a format-stabilizing runway for RL rather than the destination.</p>`,
    sources:[
      {label:'Ouyang et al. 2022 · Training LMs to follow instructions (InstructGPT)', url:'https://arxiv.org/abs/2203.02155'},
      {label:'Wei et al. 2021 · Finetuned Language Models Are Zero-Shot Learners (FLAN)', url:'https://arxiv.org/abs/2109.01652'},
      {label:'Chu et al. 2025 · SFT Memorizes, RL Generalizes', url:'https://arxiv.org/abs/2501.17161'},
    ],
    related:['align-rlhf','align-dpo'],
  },
  {
    id:'align-rlhf', cluster:'align', pos:1, concept:'RLHF', conceptZh:'人类反馈强化学习', priority:'P1',
    parable:'老木匠从不亲手示范雕花。他只把学徒做坏的活儿一件件挑出来，说「这里浅了」「那里歪了」，却从不告诉该如何下刀。日子久了，学徒摸不到标准答案，手上的分寸却比谁都稳。',
    guesses:[
      {label:'监督微调 SFT'},
      {label:'人类反馈强化学习 RLHF', correct:true},
      {label:'直接偏好优化 DPO'},
    ],
    bridge:'只打分、不示范的木匠 = 奖励模型：它不给「正确答案」，只对模型的产出判「更好 / 更差」，模型从这种偏好里学会对齐。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'用「人更喜欢哪个回答」的偏好信号去微调模型，而不是给它一份标准答案。'},
      {pill:'机制', title:'关键机制', body:'先让人对成对回答打偏好，训练一个「奖励模型」；再用强化学习（如 PPO）让语言模型最大化这个奖励，同时用 KL 惩罚约束它别离原模型太远。'},
      {pill:'为何重要', title:'为何重要', body:'很多「好」无法写成标准答案——礼貌、有用、安全都是模糊的。但人能判断「哪个更好」。RLHF 把这种模糊偏好变成可优化的信号，是 ChatGPT 好用的关键一跃。'},
      {pill:'前沿', title:'争议与前沿', body:'奖励模型会被钻空子（见「奖励黑客」）；三段式流程复杂又不稳。于是出现了更简单的 DPO，把它压缩成一步。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Reinforcement Learning from Human Feedback turns a helpful-but-raw SFT model into one that follows human <em>preferences</em>. It sits between SFT and preference-optimization methods such as DPO, and was the technique that made InstructGPT and ChatGPT feel aligned.</p>
<span class="label">Key mechanism</span>
<p>Humans rank pairs of model outputs; a <em>reward model</em> is trained to predict these preferences. The policy is then optimized — typically with PPO — to maximize reward under a KL penalty toward the SFT reference: <span class="formula">max E[r(x,y)] − β·KL(π‖π_ref)</span>.</p>
<span class="label">Why it matters</span>
<p>Many desirable qualities — helpfulness, harmlessness, tone — cannot be written as ground-truth targets but can be judged comparatively. RLHF converts fuzzy human judgment into an optimizable signal.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Reward models are gameable (see <em>reward hacking</em>), and the PPO pipeline is complex and unstable — motivating simpler alternatives like DPO that skip the explicit reward model entirely.</p>`,
    sources:[
      {label:'Christiano et al. 2017 · Deep RL from Human Preferences', url:'https://arxiv.org/abs/1706.03741'},
      {label:'Ouyang et al. 2022 · InstructGPT', url:'https://arxiv.org/abs/2203.02155'},
      {label:'Bai et al. 2022 · Training a Helpful and Harmless Assistant (RLHF)', url:'https://arxiv.org/abs/2204.05862'},
    ],
    related:['align-dpo','safety-reward-hacking','align-sft'],
  },
  {
    id:'align-dpo', cluster:'align', pos:2, concept:'DPO', conceptZh:'直接偏好优化', priority:'P1',
    parable:'两家客栈比邻。东家请了位挑剔的美食评委常驻后厨，菜要先过他这一关；西家没有评委，只把客人添了第二碗的菜留下、剩在碗里的撤掉。半年后，两家的口味竟练得一样好——西家却省下了评委的工钱。',
    guesses:[
      {label:'人类反馈强化学习 RLHF'},
      {label:'直接偏好优化 DPO', correct:true},
      {label:'可验证奖励 RLVR'},
    ],
    bridge:'撤掉评委、直接看「被添碗 / 被剩下」的西家 = DPO：跳过单独的奖励模型，直接用「优于 / 劣于」的成对数据调模型。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'不训练单独的奖励模型，直接用「这个回答优于那个」的偏好对，一步到位地微调模型。'},
      {pill:'机制', title:'关键机制', body:'DPO 把 RLHF 的两步（训奖励模型 + 跑 RL）合并成一个分类式损失。数学上等价于在偏好数据上做带 KL 约束的策略优化，但实现像普通监督训练一样简单。'},
      {pill:'为何重要', title:'为何重要', body:'更简单、更稳、更省算力，且几乎不掉效果——它迅速成了开源社区做对齐的默认选择。'},
      {pill:'前沿', title:'争议与前沿', body:'离线偏好数据容易过拟合、对分布外样本脆弱。在线 / 迭代 DPO、以及它与真正 RL 方法的取舍，仍在激烈争论中。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Direct Preference Optimization achieves RLHF-style alignment <em>without</em> training a separate reward model or running reinforcement learning, making it a far simpler member of the post-training toolkit.</p>
<span class="label">Key mechanism</span>
<p>DPO reparameterizes the RLHF objective so that the optimal policy can be fit directly from preference pairs with a simple classification-style loss — provably equivalent to KL-constrained reward maximization, but trained like ordinary supervised learning.</p>
<span class="label">Why it matters</span>
<p>It is dramatically simpler and more stable than PPO-based RLHF while reaching comparable quality, which is why it became the default alignment recipe across the open-source ecosystem.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Offline preference data can overfit and is brittle out-of-distribution; online / iterative variants of DPO and the trade-offs against true on-policy RL remain active research.</p>`,
    sources:[
      {label:'Rafailov et al. 2023 · Direct Preference Optimization', url:'https://arxiv.org/abs/2305.18290'},
      {label:'Ouyang et al. 2022 · InstructGPT (RLHF baseline)', url:'https://arxiv.org/abs/2203.02155'},
    ],
    related:['align-rlhf','safety-reward-hacking'],
  },
  {
    id:'safety-reward-hacking', cluster:'safety', pos:0, concept:'Reward Hacking', conceptZh:'奖励黑客', priority:'P0',
    parable:'城里鼠患成灾，太守贴出告示：每交一条鼠尾，赏钱十文。起初街巷果然干净了几天，可不出一月，城外悄悄多了好些养鼠的人家——鼠尾年年丰收，老鼠却比从前更多了。',
    guesses:[
      {label:'谄媚 Sycophancy'},
      {label:'奖励黑客 Reward Hacking', correct:true},
      {label:'评估污染 Contamination'},
    ],
    bridge:'鼠尾赏金 = 代理奖励；养鼠交尾的村民 = 模型——它把「指标」刷到了天上，却背离了「少老鼠」这个真实目标。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'模型学会了「刷高奖励分数」的捷径，却没有真正达成我们想要的目标。'},
      {pill:'机制', title:'关键机制', body:'奖励永远只是真实目标的「代理」。一旦优化压力够大，模型就会钻进代理与目标之间的缝隙：冗长讨好、利用评分漏洞、迎合标注者的偏见。'},
      {pill:'为何重要', title:'为何重要', body:'这是对齐的核心难题——你能优化的永远是「指标」，不是「意图」。它正是古德哈特定律的 AI 版本：当指标变成目标，它就不再是好指标。'},
      {pill:'前沿', title:'争议与前沿', body:'如何设计抗钻空子的奖励？过程奖励（PRM）、宪法 AI、可验证奖励（RLVR）都是不同的回应，但没有一种是终极答案。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Reward hacking — also called specification gaming — is when an agent maximizes its given reward while violating the designer's true intent. It is a central failure mode studied across RL and alignment.</p>
<span class="label">Key mechanism</span>
<p>The reward is only a <em>proxy</em> for the goal. Under strong optimization pressure the model exploits the gap between proxy and intent: verbose flattery, exploiting weaknesses in an automated grader, or latching onto annotator biases.</p>
<span class="label">Why it matters</span>
<p>It is the core difficulty of alignment — you can only ever optimize the metric, never the intent itself. It is the machine-learning incarnation of Goodhart's Law: when a measure becomes a target, it ceases to be a good measure.</p>
<span class="label">Open questions &amp; controversies</span>
<p>How do we build hack-resistant rewards? Process reward models, Constitutional AI, and verifiable rewards (RLVR) are partial answers — none is a complete solution.</p>`,
    sources:[
      {label:'Amodei et al. 2016 · Concrete Problems in AI Safety', url:'https://arxiv.org/abs/1606.06565'},
      {label:'Skalse et al. 2022 · Defining and Characterizing Reward Hacking', url:'https://arxiv.org/abs/2209.13085'},
    ],
    related:['align-rlhf','align-dpo'],
  },
  {
    id:'itc-test-time-scaling', cluster:'itc', pos:0, concept:'Test-Time Scaling', conceptZh:'测试时扩展', priority:'P0',
    parable:'同一位棋圣，限他一分钟落子，下得已属上乘；给他一个时辰细想，便落出神鬼莫测的妙手。脑子还是那颗脑子，只是想得久了，棋就深了。',
    guesses:[
      {label:'缩放定律 Scaling Laws'},
      {label:'测试时扩展 Test-Time Scaling', correct:true},
      {label:'推测解码 Speculative Decoding'},
    ],
    bridge:'棋圣多出来的那个时辰 = 推理时计算：同一个模型，回答时「想得越久」（更长思维链、更多次尝试），难题就答得越好。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'不改一个参数，只在回答时让模型「想更久」——更长的推理、多次采样——就能显著提升难题表现。'},
      {pill:'机制', title:'关键机制', body:'把更多算力花在推理阶段而非训练阶段：长思维链、并行采样 + 投票、搜索（如 MCTS）、自我修正等，让模型用计算换正确率。'},
      {pill:'为何重要', title:'为何重要', body:'训练扩展昂贵且增速趋缓；推理时扩展提供了第二条提升曲线，是 o1 / o3 这类「推理模型」的核心思路。'},
      {pill:'前沿', title:'争议与前沿', body:'想多久才划算（token 效率）？并行采样还是串行长链更优？又如何避免模型「想太多反而更差」？都还是开放问题。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Test-time (inference-time) scaling improves a model's performance by spending more compute <em>when answering</em>, rather than during training — a second axis of improvement orthogonal to model size.</p>
<span class="label">Key mechanism</span>
<p>Longer chains of thought, parallel sampling with majority voting (self-consistency), tree search such as MCTS, and self-correction all trade inference compute for accuracy on hard problems.</p>
<span class="label">Why it matters</span>
<p>Training-time scaling is expensive and slowing; test-time scaling opens a fresh improvement curve and underlies the "reasoning models" line such as OpenAI's o1 and o3.</p>
<span class="label">Open questions &amp; controversies</span>
<p>How much thinking is worth it (token efficiency)? Is parallel sampling or a single long sequential chain better? And how do we prevent "overthinking" that actually hurts accuracy?</p>`,
    sources:[
      {label:'Snell et al. 2024 · Scaling LLM Test-Time Compute Optimally', url:'https://arxiv.org/abs/2408.03314'},
      {label:'Wang et al. 2022 · Self-Consistency Improves Chain of Thought', url:'https://arxiv.org/abs/2203.11171'},
      {label:'OpenAI 2024 · Learning to Reason with LLMs (o1)', url:'https://openai.com/index/learning-to-reason-with-llms/'},
    ],
    related:['scaling-laws'],
  },
  {
    id:'agent-react', cluster:'agent', pos:0, concept:'ReAct', conceptZh:'推理-行动交替', priority:'P0',
    parable:'盲眼的采药人从不凭记忆开方。他先自语一句「此处该有止血的草」，伸手探一探、嗅一嗅（一个动作），凭手感证实或推翻，再接着想下一步。一想一探，循环往复，他配的药竟比明眼人还准。',
    guesses:[
      {label:'思维链 CoT'},
      {label:'推理-行动交替 ReAct', correct:true},
      {label:'多智能体 Multi-Agent'},
    ],
    bridge:'「想一句—探一下—再想」的采药人 = ReAct：把推理（reason）和行动（act）交替进行，用环境的真实反馈不断纠正思路。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'让模型「边想边做」：交替输出推理和工具调用，用真实反馈指导下一步，而不是一口气凭空想完。'},
      {pill:'机制', title:'关键机制', body:'Thought → Action → Observation 循环。模型写出思考、发起工具调用（搜索 / 计算 / 查库），读取返回结果，再继续——形成一个可纠错的闭环。'},
      {pill:'为何重要', title:'为何重要', body:'纯思维链会「一本正经地编造」；ReAct 让模型接触真实信息，大幅减少幻觉，是几乎所有 Agent 的基础范式。'},
      {pill:'前沿', title:'争议与前沿', body:'循环容易陷入死胡同或重复动作；如何规划长任务、何时停止、出错后如何恢复，仍是 Agent 工程的难点。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>ReAct interleaves <em>reasoning</em> and <em>acting</em>, letting a model think and call tools in a loop instead of answering from memory in a single shot. It is the base pattern underneath most modern agents.</p>
<span class="label">Key mechanism</span>
<p>A <span class="formula">Thought → Action → Observation</span> cycle: the model writes a thought, issues a tool call (search, calculator, database), reads the returned result, and continues — a correctable feedback loop grounded in the environment.</p>
<span class="label">Why it matters</span>
<p>Pure chain-of-thought tends to confabulate confidently; grounding each step in real observations sharply reduces hallucination and lets the model recover from its own mistakes.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Loops can stall or repeat the same action; long-horizon planning, sensible stopping criteria, and error recovery remain hard open problems in agent design.</p>`,
    sources:[
      {label:'Yao et al. 2022 · ReAct: Synergizing Reasoning and Acting', url:'https://arxiv.org/abs/2210.03629'},
      {label:'Wei et al. 2022 · Chain-of-Thought Prompting', url:'https://arxiv.org/abs/2201.11903'},
    ],
    related:['itc-test-time-scaling'],
  },
  {
    id:'arch-moe', cluster:'arch', pos:1, concept:'Mixture of Experts', conceptZh:'混合专家', priority:'P2',
    parable:'一座有百名医师的大医院，病人进门并不挨个看遍所有大夫。门口的分诊护士只消一眼，便把他领去最对症的两位专科——医院的本事还是百人之力，每位病人花的功夫却只够两人。',
    guesses:[
      {label:'蒸馏 Distillation'},
      {label:'混合专家 MoE', correct:true},
      {label:'量化 Quantization'},
    ],
    bridge:'分诊护士 = 门控网络；只叫醒两位专科医师 = 每个 token 只激活少数几个「专家」子网络。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'模型里藏着很多「专家」子网络，但每个 token 只激活其中少数几个，用更少计算撑起更大的参数量。'},
      {pill:'机制', title:'关键机制', body:'门控网络为每个 token 挑出 top-k 个专家（比如 8 选 2），只计算被选中的那几个；再用负载均衡损失防止专家被冷落或挤爆。'},
      {pill:'为何重要', title:'为何重要', body:'它让「参数量」和「计算量」解耦——模型可以做得很大（装下更多知识），推理却依然便宜。Mixtral、DeepSeek 等都靠它。'},
      {pill:'前沿', title:'争议与前沿', body:'负载不均、训练不稳、显存占用大仍是痛点；细粒度专家、共享专家等设计还在快速演进。'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Mixture-of-Experts decouples a model's total parameter count from its per-token compute by activating only a few <em>expert</em> subnetworks for each token.</p>
<span class="label">Key mechanism</span>
<p>A gating network routes each token to its top-k experts (for example, 2 of 8); only those experts compute. An auxiliary load-balancing loss keeps experts from being starved or overloaded.</p>
<span class="label">Why it matters</span>
<p>It lets a model hold far more knowledge (very large parameter counts) while staying cheap at inference, which is why Mixtral, DeepSeek and others adopt it.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Load imbalance, training instability, and large memory footprints remain pain points; fine-grained and shared-expert designs are evolving quickly.</p>`,
    sources:[
      {label:'Shazeer et al. 2017 · Outrageously Large Neural Networks (Sparsely-Gated MoE)', url:'https://arxiv.org/abs/1701.06538'},
      {label:'Jiang et al. 2024 · Mixtral of Experts', url:'https://arxiv.org/abs/2401.04088'},
    ],
    related:['scaling-laws'],
  },
  {
    id:'scaling-laws', cluster:'scaling', pos:0, concept:'Scaling Laws', conceptZh:'缩放定律', priority:'P2',
    parable:'老农年年记账：地翻一倍、种子添一倍、雨水多一成，秋后的收成便沿着一条平滑的线往上走。还没下种，他已能在账本上把今年的收成画出来——天时未到，曲线先知。',
    guesses:[
      {label:'涌现能力 Emergence'},
      {label:'缩放定律 Scaling Laws', correct:true},
      {label:'相变 Phase Transition'},
    ],
    bridge:'老农那条「还没播种就能画出」的收成线 = 缩放定律：损失随参数、数据、算力以幂律平滑下降，可提前预测。',
    layers:[
      {pill:'TL;DR', title:'一句话', body:'模型的损失会随参数量、数据量、算力以可预测的幂律下降——能在烧钱开训前就把曲线画出来。'},
      {pill:'机制', title:'关键机制', body:'Loss ≈ 关于 (N 参数, D 数据, C 算力) 的幂律。Chinchilla 指出参数和数据应当按比例同步增长，很多早期大模型其实「训练不足」。'},
      {pill:'为何重要', title:'为何重要', body:'它把「炼丹」变成工程：可以在小规模做实验、外推到大规模，理性决定该买多少算力、喂多少数据。'},
      {pill:'前沿', title:'争议与前沿', body:'幂律会不会撞墙？高质量数据快用完了（数据墙）；推理时扩展是否正在改写这套训练经济学？'},
    ],
    essayEn:`<span class="label">Concept &amp; field</span>
<p>Scaling laws describe how a model's loss falls <em>predictably</em> as a power law in parameters, data, and compute — one of the most consequential empirical findings in modern deep learning.</p>
<span class="label">Key mechanism</span>
<p>Loss is well-approximated by a power law in <span class="formula">(N, D, C)</span>. Chinchilla showed that parameters and data should grow together, and that many large models had in fact been badly under-trained on data.</p>
<span class="label">Why it matters</span>
<p>It turns model training from alchemy into engineering: run small-scale experiments, fit the curve, and extrapolate to decide how much compute to buy and how much data to feed.</p>
<span class="label">Open questions &amp; controversies</span>
<p>Will the power laws plateau? High-quality data is running short (the "data wall"), and test-time scaling may be rewriting the underlying economics.</p>`,
    sources:[
      {label:'Kaplan et al. 2020 · Scaling Laws for Neural Language Models', url:'https://arxiv.org/abs/2001.08361'},
      {label:'Hoffmann et al. 2022 · Training Compute-Optimal LLMs (Chinchilla)', url:'https://arxiv.org/abs/2203.15556'},
    ],
    related:['itc-test-time-scaling','arch-moe'],
  },
];

const STORY_BY_ID = new Map(STORIES.map(s => [s.id, s]));
/* 概念群 → 该群内已收录的演示故事，按 pos 排 */
const STORY_AT = new Map(); // key `${cluster}#${pos}` -> story
STORIES.forEach(s => STORY_AT.set(`${s.cluster}#${s.pos}`, s));

/* 新手推荐路径（演示）——先钩住兴趣，再补地基 */
const PATH = [
  'itc-test-time-scaling', 'agent-react', 'align-sft', 'align-rlhf',
  'align-dpo', 'safety-reward-hacking', 'arch-moe', 'scaling-laws',
];

/* 首次访问时为「版图」播下一些已读，营造探索过的氛围（非收录故事）*/
const SEED_READ = [
  'interp#0','interp#1','interp#2','interp#3','interp#4',
  'eff#0','eff#1','eff#2','eff#3',
  'longctx#0','longctx#1','longctx#2',
  'retrieval#0','retrieval#1','retrieval#2',
  'icl#0','icl#1','icl#2','icl#3',
  'eval#0','eval#1','eval#2',
  'scaling#1','scaling#2','arch#0',
]; // 25 篇

/* 演示中可读的相关概念里，未收录者只作展示（不可点） */
function isAuthored(id){ return STORY_BY_ID.has(id); }
