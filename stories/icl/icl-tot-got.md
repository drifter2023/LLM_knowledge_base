---
id: icl-tot-got
cluster: icl
concept: Tree-of-Thoughts / Graph-of-Thoughts
status: done
sources:
  - https://arxiv.org/abs/2305.10601
  - https://arxiv.org/abs/2308.09687
  - https://github.com/princeton-nlp/tree-of-thought-llm
  - https://github.com/spcl/graph-of-thoughts
generated_at: 2026-04-25
---

老周在城南开了一家小小的密室设计工作室，雇了三个新来的学徒：阿临、阿岚、阿织。第一单生意是一座叫"二十四"的谜题屋——客人进门拿到四张数字牌，必须用加减乘除把它们凑成二十四，凑不出就出不来。

阿临最早交稿。他在白板最上方写下四个数字，然后从左到右一路推：先加，再乘，再减，写到最后一行发现凑不出，懊恼地把白板擦了，从头再来。他擦了七次，第八次终于碰上一条能走通的路。老周看着那块被擦得发白的板子，叹了口气，说："你不是在解题，你是在赌。"

第二天换阿岚上场。阿岚不急着写字，先在白板上画了一棵倒过来的树。树根是那四个数字，第一层她列出所有"先把哪两个数合起来"的可能：六种。每一种合并完，她都不急着往下走，而是停下来端详片刻，给自己打个分——"这一步之后，剩下的三个数离二十四还有多远？看起来有戏，还是已经废了？"看起来废掉的枝条，她当场剪掉；看起来有戏的，她才往下生第二层。需要时她也会回到上一个岔口，换一条没走过的枝再试。那天傍晚，她不仅解出了题，还在白板上留下一整棵被剪得很干净的树，每个叶子要么写着"二十四"，要么写着一个被她打了叉的死路。老周点点头："你在搜索，不是在赌。"

第三个轮到阿织。阿织看了看阿岚那棵漂亮的树，没有照搬。她先让三个客人——一个数学老师、一个会计、一个魔术师——各自独立地尝试解一遍，得到三条互不相干的草稿。然后她把三张草稿钉在白板上，用红线把它们之间彼此呼应的中间结果连起来：数学老师在第二步算出的那个十二，恰好是会计第三步要用的；魔术师走到一半放弃的某个组合，正好暗示了另一条路上不该再试的方向。她甚至画了一条回头的箭头——把最终接近成功的那个表达式，喂回去让大家再润色一遍，看看能不能更简洁。最后白板上不再是树，而是一张缠绕的网：节点是想法，边是想法之间的依赖、汇合、回流。她交出的答案不止解出了二十四，还顺手给出了三种不同写法，并指出哪一种最不容易让客人觉得"被骗"。

老周在打烊前把三块白板并排摆好，对学徒们说：

"阿临走的是一条直线——一步错，全盘废。
阿岚长的是一棵树——她允许自己分叉，允许自己回头，所以她能赢。
阿织织的是一张图——她让不同的思路彼此说话，让一个想法去喂养另一个想法。

你们今天看到的，就是大模型这两年学会的两件事：把推理摊开成一棵可以搜索的树，再进一步，把那棵树缝合成一张可以汇流的图。"

---

## Concept and Field

**Tree-of-Thoughts (ToT)** and **Graph-of-Thoughts (GoT)** are inference-time reasoning frameworks for large language models, sitting in the **In-Context Learning / prompting & reasoning** cluster. They generalize Chain-of-Thought (CoT) by giving the model an explicit *search structure* over intermediate reasoning steps, rather than committing to a single left-to-right token stream.

## Key Mechanism

**Tree-of-Thoughts** (Yao et al., NeurIPS 2023) decomposes a problem into discrete "thoughts" — coherent intermediate text units (e.g., one arithmetic step in Game of 24, one paragraph plan in Creative Writing). It then runs a classical search over a tree whose nodes are partial solutions:

1. **Thought generation** — at each node, prompt the LLM to propose *k* candidate next thoughts (sampling or "propose-prompt").
2. **State evaluation** — prompt the LLM to *self-evaluate* each candidate as `sure / maybe / impossible`, or to vote among siblings. This produces a heuristic value used by the search.
3. **Search** — apply BFS or DFS over the tree, pruning low-value branches and backtracking when a path is dead. On Game of 24, ToT lifts GPT-4 from 4% (CoT) to **74%** success.

**Graph-of-Thoughts** (Besta et al., AAAI 2024) relaxes the tree constraint. Thoughts are vertices in an arbitrary DAG (or even a graph with cycles via feedback loops), and the framework defines explicit *thought transformations*:

- **Generation** — branch new thoughts from a parent (as in ToT).
- **Aggregation** — *merge* multiple independent thoughts into one combined thought (impossible in a tree because a node would need multiple parents).
- **Refinement** — a self-loop that improves a thought via feedback.
- **Scoring / ranking** — value individual thoughts to guide which to keep.

This lets independently-explored sub-solutions be fused. On sorting tasks, GoT reports **+62% quality** and **>31% cost reduction** versus ToT.

## Why It Matters

CoT is bound to a single trajectory; one bad early token poisons the rest. ToT reframes LLM inference as **deliberate, System-2-style search** with the LLM acting as both proposer and heuristic. GoT goes further by recognizing that human reasoning is not strictly hierarchical — partial insights from different lines should be able to *combine*. Together they are the canonical reference points for "structured reasoning at inference time," and they prefigure the modern wave of agentic search, self-consistency variants, and verifier-guided decoding.

## Open Questions

- **Cost.** Both methods spend many more LLM calls per problem than CoT. When does the accuracy gain justify the token bill, and when does training-time reasoning (e.g., RL-trained reasoners) dominate?
- **Self-evaluation reliability.** ToT's pruning trusts the same model to score its own thoughts; calibration of these scores remains shaky on tasks the model is poor at.
- **Graph control.** GoT's expressive power introduces a new design burden — choosing the right thought transformations per task is itself an open prompt-engineering problem.

## References

- Yao, S., Yu, D., Zhao, J., Shafran, I., Griffiths, T. L., Cao, Y., & Narasimhan, K. (2023). *Tree of Thoughts: Deliberate Problem Solving with Large Language Models.* NeurIPS 2023. https://arxiv.org/abs/2305.10601
- Besta, M., Blach, N., Kubicek, A., et al. (2024). *Graph of Thoughts: Solving Elaborate Problems with Large Language Models.* AAAI 2024. https://arxiv.org/abs/2308.09687
- Princeton NLP, official ToT implementation. https://github.com/princeton-nlp/tree-of-thought-llm
- SPCL, official GoT implementation. https://github.com/spcl/graph-of-thoughts
