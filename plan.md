我把当前学界对大语言模型的研究分成 **12 个研究生级别的概念簇**，每个簇下列出该方向的核心概念和代表性论文。这份清单的目标是让你看完之后，知道整个 LLM 研究地图大致长什么样、自己感兴趣的方向应该往哪里深入。

本文件同时是 **多 Agent 寓言生成系统的源单（source-of-truth）**：每个概念都有稳定 ID、状态字段、输出路径约定，可被 orchestrator / researcher / storywriter / explainer / reviewer 等角色协作消费。

---

## 多 Agent 工作流 (Multi-Agent Workflow)

### 角色分工

| 角色 | 职责 | 输入 | 输出 |
|---|---|---|---|
| **Orchestrator** | 按优先级 + 状态从下表中挑选未完成概念，原子地把状态从 `pending` 改为 `in_progress`，分派给 generator pipeline；防止重复领取 | 本文件的概念表 | 任务派发 + 状态更新 |
| **Researcher** | 用 Web Search 检索权威来源（论文、百科、大学站点），生成一份 research brief（机制、关键论文、争议点、引用链接） | 概念名 + 简介 | research brief（结构化） |
| **Storywriter** | 基于 brief 写**中文寓言**，必须以人物/可关联场景间接呈现概念，**全文不得点名概念**，谜底只能在结尾揭开 | research brief | Chinese parable |
| **Explainer** | 基于同一份 brief 写**英文正式说明**：name, field, key mechanisms, why it matters, citations | research brief | English explanation |
| **Reviewer** | 校验：(1) 故事正文未提前泄露概念名；(2) 英文说明事实正确、有引用；(3) 中英文紧扣同一概念 | story + explanation | `done` 或回退到 `in_progress` 并附 issue |

### 流水线时序

```
Orchestrator → Researcher → Storywriter ┐
                          → Explainer  ─┴→ Reviewer → Orchestrator (mark done)
```

`Storywriter` 与 `Explainer` 可并行（同一份 brief，互不依赖）；`Researcher` 必须先于二者；`Reviewer` 必须在二者之后。

### 文件约定

- 每个故事一个文件：`stories/<cluster-id>/<concept-id>.md`
- 文件 frontmatter（必填）：

  ```yaml
  ---
  id: <concept-id>
  cluster: <cluster-id>
  concept: <concept name in English>
  status: done
  sources:
    - <url 1>
    - <url 2>
  generated_at: YYYY-MM-DD
  ---
  ```

- 文件正文顺序固定：先中文寓言，分隔线，再英文说明。

### 状态字段

每行 `状态` 列的合法值：

- `pending` — 尚未被任何 agent 领取（默认）
- `in_progress` — 已被 orchestrator 派发，正在生成中
- `review` — story + explanation 已写完，等待 Reviewer
- `done` — 已通过 Reviewer，文件已落盘

Orchestrator 在领取概念时**必须**直接改写本文件对应行的状态字段——这是并发锁。

### 优先级分层

源自本文件末尾"给你的针对性建议"，由 orchestrator 用来排序：

- **P0（必须深入）**：簇 5、9、10 — 直接关联用户工作
- **P1（强烈推荐）**：簇 4、6 — 从"用 LLM"到"懂 LLM"的关键
- **P2（了解即可）**：簇 1、2、11
- **P3（按需查阅）**：簇 3、7、8、12

簇标题后会标注优先级，例如 `## 5. 推理时计算与思考模型 (P0)`。

### Concept ID 命名规则

`<cluster-prefix>-<kebab-case-name>`，全英文小写，例如 `align-rlvr`、`interp-sae`、`itc-long-cot`。簇前缀见下表。

| 簇号 | 前缀 |
|---|---|
| 1 | `arch` |
| 2 | `scaling` |
| 3 | `icl` |
| 4 | `align` |
| 5 | `itc` |
| 6 | `interp` |
| 7 | `longctx` |
| 8 | `retrieval` |
| 9 | `agent` |
| 10 | `safety` |
| 11 | `eff` |
| 12 | `eval` |

---

## 1. 架构与表征 (Architecture & Representation) — P2

LLM 内部数据结构与计算单元的研究。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `arch-self-attention-kv-cache` | **Self-Attention 与 KV Cache** | Transformer 的注意力机制以及推理时的关键值缓存。Vaswani et al., 2017 是起点；近年关注 KV cache 压缩、量化、PagedAttention (vLLM) | done |
| `arch-moe` | **Mixture of Experts (MoE)** | 稀疏激活专家路由——只激活部分参数推理。代表：GShard、Switch Transformer、DeepSeek-V3、Mixtral | done |
| `arch-ssm` | **State Space Models (SSM)** | Mamba、S4 等替代 Transformer 的线性时序架构，O(N) 复杂度 | done |
| `arch-linear-attention` | **Linear Attention / Hybrid 架构** | RWKV、RetNet、Jamba ——把 attention 和递归结合 | done |
| `arch-diffusion-lm` | **Diffusion Language Models** | LLaDA、Mercury、Gemini Diffusion ——以扩散范式做文本生成，并行解码 | done |
| `arch-tokenization` | **Tokenization 理论** | BPE、SentencePiece、Tiktoken；近期关注 byte-level、tokenizer-free 模型 (BLT, Byte Latent Transformer) | done |
| `arch-rope-alibi-ntk` | **RoPE / ALiBi / NTK 位置编码** | 旋转位置编码、长度外推、上下文长度扩展的几何机制 | done |
| `arch-superposition` | **Superposition & Polysemanticity** | 我们前面讨论过的叠加表征理论。Elhage et al., 2022 | done |

---

## 2. 训练动力学与可扩展性 (Training Dynamics & Scaling) — P2

模型为什么能从 scaling 中获得能力。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `scaling-laws` | **Scaling Laws** | Kaplan 2020 / Chinchilla (Hoffmann 2022) ——参数、数据、计算之间的幂律关系。Chinchilla 重新校准了"数据 vs 参数"的最优配比 | done |
| `scaling-emergent-abilities` | **Emergent Abilities** | Wei et al., 2022 ——能力随规模出现"相变"。后被 Schaeffer 2023 质疑（指标选择伪影） | done |
| `scaling-grokking` | **Grokking** | Power et al., 2022 ——训练长期停滞后突然泛化的相变现象 | done |
| `scaling-loss-landscape` | **Loss Landscape & Mode Connectivity** | 神经网络损失面的几何结构、宽极小值与泛化的关系 | done |
| `scaling-phase-transitions` | **Phase Transitions in Training** | 训练过程中的相变现象，如 induction head 形成 (Olsson et al., 2022) | done |
| `scaling-data-quality-laws` | **Data Scaling & Quality Laws** | DataComp-LM、FineWeb 等工作揭示数据质量对 scaling 的影响 | done |
| `scaling-compute-vs-inference-optimal` | **Compute-Optimal vs Inference-Optimal** | "训练算最优"和"推理算最优"的区别——Llama 3 选择超训练（Over-training）以优化推理效率 | done |

---

## 3. 上下文学习与提示理论 (In-Context Learning & Prompting Theory) — P3

为什么 LLM 不需要梯度更新就能学会新任务。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `icl-base` | **In-Context Learning (ICL)** | Brown et al., 2020 ——few-shot 的能力涌现 | done |
| `icl-bayesian-inference` | **ICL as Implicit Bayesian Inference** | Xie et al., 2022 ——把 ICL 解释为隐式贝叶斯更新 | done |
| `icl-as-gradient-descent` | **ICL as Gradient Descent** | von Oswald et al., 2023 ——线性 attention 等价于 implicit GD | done |
| `icl-induction-heads` | **Induction Heads** | Olsson et al., 2022 ——一种特定 attention 模式被认为是 ICL 的机械基础 | done |
| `icl-cot` | **Chain-of-Thought (CoT)** | Wei et al., 2022 ——推理过程显式化的奇效 | done |
| `icl-self-consistency` | **Self-Consistency** | Wang et al., 2022 ——多次采样取多数答案 | done |
| `icl-tot-got` | **Tree-of-Thoughts / Graph-of-Thoughts** | 把推理过程结构化为树/图 | done |
| `icl-prompt-tuning` | **Prompt Tuning vs Prefix Tuning** | 学习连续 prompt 向量代替离散 token | done |

---

## 4. 后训练与对齐 (Post-training & Alignment) — P1

预训练完之后怎么把模型"调教"成有用的。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `align-sft` | **SFT (Supervised Fine-Tuning)** | 监督微调，让模型学会按指令格式回应 | done |
| `align-rlhf` | **RLHF (Reinforcement Learning from Human Feedback)** | Christiano 2017 / Ouyang 2022 (InstructGPT) ——通过人类偏好训练奖励模型，再用 PPO 优化 | done |
| `align-dpo` | **DPO (Direct Preference Optimization)** | Rafailov et al., 2023 ——绕过显式奖励模型，直接从偏好数据优化策略 | done |
| `align-grpo` | **GRPO (Group Relative Policy Optimization)** | DeepSeek-Math/R1 提出，去掉 critic 网络，组内归一化奖励——已成为 RLVR 的事实标准 | done |
| `align-rlvr` | **RLVR (RL with Verifiable Rewards)** | 2025 年最重要范式之一。用可验证的奖励（数学正确性、代码通过单元测试）取代偏好奖励，催生了 o1、R1 等推理模型 | done |
| `align-ppo-variants` | **PPO 变体：DAPO、Reinforce++、RLOO** | GRPO 的替代/改进算法 | done |
| `align-constitutional-ai-rlaif` | **Constitutional AI / RLAIF** | Bai et al., 2022 ——用 AI 反馈替代人类反馈 | done |
| `align-prm` | **Process Reward Models (PRM)** | 对推理过程逐步打分，而非只看最终答案。Math-Shepherd 系列 | done |
| `align-self-play` | **Self-Play & Self-Improvement** | SPELL、Self-Rewarding LM ——让模型作为自己的 critic | done |
| `align-reward-hacking` | **Reward Hacking** | 模型钻奖励规则的漏洞，是 RLHF 的核心难题 | done |

> **争议性发现**：2025 年多项研究（如 Yue et al. 的 *Does RL Really Incentivize Reasoning?*）质疑 RLVR 是否真的扩展了模型推理边界，还是只放大了 base model 已有的能力。这是当下最热的开放问题之一——Researcher 在处理 `align-rlvr` 时**必须**把这一争议纳入 brief。

---

## 5. 推理时计算与思考模型 (Inference-Time Compute & Reasoning Models) — P0

2025 年最重要的范式转变：从"训练时投入"转向"推理时投入"。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `itc-test-time-scaling` | **Test-Time Compute Scaling** | OpenAI o1 论文揭示的范式：让模型在推理时"思考更久"换取更高准确率 | done |
| `itc-long-cot` | **Long Chain-of-Thought** | DeepSeek-R1 风格的长推理轨迹（数千到数万 token） | done |
| `itc-parallel-vs-sequential` | **Parallel vs Sequential Scaling** | 并行（多次采样投票）vs 串行（更长 CoT）两种推理时 scaling 路径 | done |
| `itc-best-of-n` | **Best-of-N / Majority Voting / Weighted Voting** | 推理时聚合多个采样结果的策略 | done |
| `itc-speculative-decoding` | **Speculative Decoding** | Leviathan et al., 2023 ——小模型起草、大模型验证，加速推理 | done |
| `itc-mcts` | **Monte Carlo Tree Search for LLMs** | rStar、AlphaProof 等把 MCTS 引入推理 | done |
| `itc-token-efficiency` | **Reasoning Token Efficiency** | 如何在不牺牲准确率的前提下减少思考 token (2026 重点) | done |

---

## 6. 机制可解释性 (Mechanistic Interpretability) — P1

我们前面讨论过的叠加表征属于这一类。这是 Anthropic 主推、被 MIT 评为 2026 突破技术的方向。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `interp-sae` | **Sparse Autoencoders (SAE)** | Bricken et al., 2023 / Templeton et al., 2024 (*Scaling Monosemanticity*) ——用稀疏字典学习从激活里解出可解释特征 | done |
| `interp-circuit-tracing` | **Circuit Tracing & Attribution Graphs** | Anthropic 2025 ——把模型行为归因到具体计算图 | done |
| `interp-crosscoders` | **Crosscoders / Transcoders** | Lindsey et al., 2024 ——跨层、跨模型对齐特征 | done |
| `interp-weight-sparse` | **Weight-Sparse Transformers** | OpenAI 2025 ——通过稀疏权重训练得到可解释电路 | done |
| `interp-linear-representation` | **Linear Representation Hypothesis** | Park et al., 2023 ——概念在激活空间中以线性方向编码 | done |
| `interp-activation-patching` | **Activation Patching / Causal Mediation** | 通过干预激活值定位因果电路 | done |
| `interp-probing` | **Probing & Diagnostic Classifiers** | 训练小分类器探测内部表征是否编码某个属性 | done |
| `interp-steering` | **Steering Vectors / Activation Steering** | 沿特定方向加减激活值控制模型行为 | done |
| `interp-gemma-scope` | **Gemma Scope / Gemma Scope 2** | DeepMind 公开发布的全套 SAE 解析包 | done |
| `interp-open-problems` | **Open Problems in Interpretability** | Sharkey et al., 2025 ——梳理了"feature 缺乏严格定义"等基础问题 | done |

---

## 7. 长上下文与记忆 (Long Context & Memory) — P3

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `longctx-position-interpolation` | **Position Interpolation / YaRN / NTK-Aware Scaling** | 训练后扩展上下文长度的几何方法 | done |
| `longctx-ring-flash-attention` | **Ring Attention / FlashAttention** | 长序列训练的工程突破 | done |
| `longctx-lost-in-middle` | **Lost in the Middle** | Liu et al., 2023 ——长上下文中间内容被忽略的现象 | done |
| `longctx-benchmarks` | **Long-Context Benchmarks** | Needle in a Haystack、RULER、∞Bench、LongBench-V2 | done |
| `longctx-external-memory` | **External Memory / Retrieval Augmentation** | RAG、RETRO、Atlas ——把记忆外置 | done |
| `longctx-compressive-memory` | **Compressive Memory / Token Pruning** | Infini-attention、StreamingLLM ——压缩历史信息 | done |
| `longctx-episodic-memory` | **Episodic Memory for Agents** | Agent 长期记忆架构（MemGPT、MemoryBank 等） | done |

---

## 8. 检索与外部知识 (Retrieval & External Knowledge) — P3

你做 RAG 系统熟悉的那部分，但在研究层面有更深议题。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `retrieval-dense-cross-encoders` | **Dense Retrieval & Cross-Encoders** | DPR、ColBERT、bi-encoder vs cross-encoder 取舍 | done |
| `retrieval-hybrid-rrf` | **Hybrid Retrieval & RRF** | BM25 + Dense 融合，倒数排名融合 | done |
| `retrieval-late-interaction` | **Late Interaction (ColBERT)** | token 级延迟交互的几何性质 | done |
| `retrieval-rag-failures` | **RAG Failure Modes** | "lost in retrieval"、"distraction by irrelevant context"、context poisoning | done |
| `retrieval-self-rag-graphrag` | **Self-RAG / CRAG / GraphRAG** | 让模型决定是否检索、检索什么、怎么验证 | done |
| `retrieval-knowledge-editing` | **Knowledge Editing (ROME, MEMIT)** | 直接编辑模型权重以改变事实知识 | done |
| `retrieval-parametric-vs-non` | **Parametric vs Non-parametric Knowledge** | 模型内化知识 vs 检索外部知识的取舍理论 | done |

---

## 9. Agent 系统与工具使用 (Agentic Systems) — P0

你有 OpenClaw 背景，应该熟悉这块——研究侧重在不同的方向。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `agent-react` | **ReAct Paradigm** | Yao et al., 2022 ——Reason + Act 交替的基础 | done |
| `agent-tool-use` | **Tool Use / Function Calling 学习理论** | Toolformer、Gorilla、Berkeley Function Calling Leaderboard | done |
| `agent-multi-agent` | **Multi-Agent Coordination** | AutoGen、ChatDev、MetaGPT；2025 hot term: Grok 4 Heavy 的 multi-agent 范式 | done |
| `agent-benchmarks` | **Agent Benchmarks** | GAIA、SWE-Bench、WebArena、OSWorld、AgentBench | done |
| `agent-rl` | **Agentic RL** | RAGEN、Search-R1 ——把 agent 决策过程纳入 RL | done |
| `agent-mcp` | **MCP (Model Context Protocol)** | Anthropic 提出，2025 已加入 Linux Foundation 成为 agent 工具协议事实标准 | done |
| `agent-failure-modes` | **Agent 失败模式与可靠性** | error compounding、infinite loops、reward hacking | done |
| `agent-autonomous-science` | **Autonomous Scientific Discovery** | LLM as Scientist (Level 3 autonomy)，自主提出假设并验证 | done |

---

## 10. 安全与对齐理论 (Safety & Alignment) — P0

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `safety-sycophancy` | **Sycophancy** | 模型迎合用户而非追求真实——已被 Anthropic 在 SAE 层面定位到具体特征 | done |
| `safety-deceptive-alignment` | **Deceptive Alignment / Mesa-Optimization** | Hubinger et al., 2019 ——内部目标可能偏离训练目标 | done |
| `safety-sleeper-agents` | **Sleeper Agents** | Hubinger et al., 2024 ——后门可能在 SFT/RLHF 后仍存活 | done |
| `safety-jailbreak` | **Jailbreak & Adversarial Attacks** | GCG、PAIR、AutoDAN ——自动化攻击 | done |
| `safety-red-teaming` | **Red Teaming** | 系统化对抗性测试 | done |
| `safety-refusal` | **Refusal Mechanisms** | 模型如何在 SAE 层面学到拒绝行为 | done |
| `safety-scalable-oversight` | **Scalable Oversight** | Bowman et al., 2022 ——比人类聪明的模型怎么监督 | done |
| `safety-debate-rrm` | **Debate / Recursive Reward Modeling** | OpenAI/DeepMind 的 scalable oversight 路径 | done |
| `safety-constitutional-ai` | **Constitutional AI** | Anthropic 用一组宪法原则 + AI 反馈做对齐 | done |
| `safety-capability-vs-propensity` | **Capability vs Propensity** | 区分"能不能做"和"愿不愿意做"——评估时常被混淆 | done |

---

## 11. 效率与系统 (Efficiency & Systems) — P2

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `eff-peft-lora` | **PEFT: LoRA / QLoRA / Adapter** | 参数高效微调 | done |
| `eff-quantization` | **Quantization: GPTQ / AWQ / SmoothQuant** | INT8/INT4/FP4 推理量化 | done |
| `eff-distillation` | **Knowledge Distillation** | DistilBERT、TinyLlama、Phi 系列 | done |
| `eff-pruning` | **Pruning & Sparsity** | 结构化/非结构化稀疏化 | done |
| `eff-flashattention` | **FlashAttention 1/2/3** | IO-aware attention 算法 | done |
| `eff-continuous-batching` | **Continuous Batching / vLLM / TensorRT-LLM** | 推理服务化的核心技术 | done |
| `eff-mixture-of-depths` | **Mixture of Depths** | 让不同 token 走不同深度的网络 | done |
| `eff-speculative-decoding` | **Speculative Decoding（系统视角）** | 起草+验证范式，参考第 5 节 `itc-speculative-decoding` 的算法侧；本条侧重系统实现 | done |
| `eff-vq-kv-cache` | **Vector Quantization for KV Cache** | KIVI、TurboQuant 等 | done |

---

## 12. 评估与基准理论 (Evaluation & Benchmarks) — P3

最被低估的研究方向之一。

| ID | 概念 | 简介 | 状态 |
|---|---|---|---|
| `eval-contamination` | **Benchmark Contamination** | 训练集污染问题——模型可能"背"过了测试集 | done |
| `eval-llm-as-judge` | **LLM-as-a-Judge** | Zheng et al., 2023 (MT-Bench) ——以及它的偏见与可靠性问题 | done |
| `eval-pairwise-vs-pointwise` | **Pairwise vs Pointwise Evaluation** | Chatbot Arena 的 Elo 范式 | done |
| `eval-capability-elicitation` | **Capability Elicitation** | 评估时的 prompt 敏感性、能力低估问题 | done |
| `eval-helm` | **Holistic Evaluation (HELM)** | Stanford CRFM 提出的多维度评估框架 | done |
| `eval-goodharts-law` | **Goodhart's Law on Benchmarks** | 当指标变成目标，它就不再是好指标——过拟合 benchmark 的现象普遍 | done |
| `eval-real-world-bench` | **MLE-Bench / SWE-Bench / Terminal-Bench** | 真实软件任务评估 | done |
| `eval-calibration` | **Calibration & Uncertainty** | 模型置信度是否反映真实正确率 | done |
| `eval-capability-forecasting` | **Capability Forecasting** | 预测下一代模型能力的方法论 | done |

---

## 推荐的阅读路径（也是 Orchestrator 的默认派发顺序）

如果按以下顺序读，能在 3-6 个月里建立研究生水平的 LLM 知识体系。Orchestrator 在没有人工指定时，**优先按此序列**派发概念，而不是单纯按 P0 → P3。

**第一阶段（基础架构）**：Transformer (`arch-self-attention-kv-cache`) → GPT-3 (`icl-base`) → Chinchilla (`scaling-laws`) → InstructGPT (`align-rlhf`)

**第二阶段（推理与对齐）**：CoT (`icl-cot`) → DPO (`align-dpo`) → DeepSeek-R1 (`align-grpo` + `itc-long-cot`) → o1 (`itc-test-time-scaling`)

**第三阶段（机制可解释性）**：Toy Models of Superposition (`arch-superposition`) → Towards Monosemanticity (`interp-sae`) → Scaling Monosemanticity (`interp-sae` 续) → Circuit Tracing (`interp-circuit-tracing`)

**第四阶段（前沿方向选其一深入）**：
- Agent 方向 → `agent-react` → `agent-tool-use` → `agent-benchmarks`
- 推理方向 → `itc-test-time-scaling` → `align-grpo` → `align-ppo-variants` → `align-rlvr`（含争议性发现）
- 可解释性方向 → `interp-open-problems` → `interp-weight-sparse`

**持续追踪资源**（Researcher 优先选用的来源）：
- *Transformer Circuits Thread* (transformer-circuits.pub) — Anthropic 可解释性主阵地
- *Sebastian Raschka 的年度综述* (magazine.sebastianraschka.com) — 写得最系统的年终回顾
- *Nathan Lambert 的 RLHF Book* (rlhfbook.com) — RL 视角最完整的教材
- arXiv cs.CL / cs.LG 每日扫一眼

---

## 给你的针对性建议（优先级分层依据）

考虑到用户背景（前端 → AI 应用工程师，关注 Agent 架构、有 OpenClaw 经验、做过 RAG），优先级分层如下：

1. **必须深入（P0）**：第 5（推理时计算）、第 9（Agent）、第 10（安全） — 直接关联用户工作
2. **强烈推荐（P1）**：第 4（RLHF/RLVR）、第 6（机制可解释性）— 能让用户从"用 LLM"升级到"懂 LLM"，是从"全栈 AI 工程师"走向"AI 技术负责人"的关键跳板
3. **了解即可（P2）**：第 1（架构）、第 2（scaling）、第 11（效率）— 能看懂论文图表和讨论即可，除非要做模型训练
4. **按需查阅（P3）**：第 3、7、8、12 — 遇到具体问题时再深入

如果以后想往 **AI 研究员/Research Engineer** 方向转（不只是应用层），第 6 节是回报最高的方向——它现在还在快速发展，进入门槛适中（不需要训练 70B 模型就能做实验），且和 alignment 紧密相关，是 Anthropic、DeepMind、OpenAI 都在重金投入的领域。

---
