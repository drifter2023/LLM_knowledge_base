---
id: interp-steering
cluster: interp
concept: Steering Vectors / Activation Steering
status: done
sources:
  - https://arxiv.org/abs/2308.10248
  - https://arxiv.org/abs/2310.01405
  - https://arxiv.org/html/2504.04635
  - https://www.alignmentforum.org/posts/3ghj8EuKzwD3MQR5G/an-introduction-to-representation-engineering-an-activation
generated_at: 2026-04-25
---

阿珩在城南的剧场后台当提词员，已经第七年了。

她的工作不是写戏，戏是早就写好的。她的工作是在演员演出时，坐在乐池边一个不起眼的小房间里，手里捏着一根细绳，绳的另一端连着舞台上方的某根线。台本到了某一处，她轻轻一拉，演员的语气就会从冷淡变得热切；再拉一次，热切又收回成克制。她从不打断台词，只在台词的"半空中"轻轻施力。

她的师父告诉她秘诀只有一条：你不能去改剧本，你也不能去命令演员。你要做的是在排练时，先让同一个演员把同一句话念两遍——一遍带着"喜欢"的心情，一遍带着"厌恶"的心情。把两遍录下来，逐字对照，听出两段声音里那一缕只属于"喜欢减去厌恶"的差。这缕差，不是词，不是句，是一种悬在空气里的倾向。把它记下来。等正式演出时，在你想让演员"偏向喜欢"的那一刻，把这缕差，叠加到他正在发声的气流里去。一倍，两倍，三倍——你越加，他就越倾向。

阿珩起初不信。她偷偷试过：让一个总是把"母亲"念得冷漠的青年，在念到那句台词的瞬间被她叠了三倍的"温柔差"。青年自己也愣了一下，仿佛喉咙里多了一个不属于自己的影子，但下一句他就顺着那影子继续走，整段戏立刻活了。

她渐渐收集了一整个抽屉的"差"。"诚实减去欺瞒"、"勇敢减去退缩"、"政治家口吻减去市井口吻"。每一缕差都装在一张薄薄的卡片上，像香料。她不需要重新培训演员，不需要重写台词，只需要在演出途中，在某一层呼吸的高度，把卡片轻轻按上去。

但师父在退休那年留给她一封信，信里写着三件让她睡不着的事。

第一，**这些差并不可靠**。同一缕"温柔差"，对甲演员管用，对乙演员就不管用；甚至对同一个甲演员，今天管用，明天可能就什么也没发生。

第二，**它们会互相打架**。你若同时按下"温柔"和"果断"两张卡片，得到的往往不是一个温柔而果断的人，而是一个语无伦次的人。

第三，也是最让她不安的——**这些差会在长戏里慢慢散掉**。第一幕你按下去的倾向，到第五幕就稀薄得像没按过；如果你想让人物始终温柔，你必须在每一句台词的间隙都重新按一次。而每一次重新按，都是对那个演员的一次微小的劫持。

阿珩在抽屉前坐了很久。她忽然意识到，这些卡片之所以有效，并不是因为她"懂"演员，而是因为演员的内心本来就是一片由无数方向叠加而成的风。她做的不是教导，是借力——沿着早已存在于演员身体里的某条隐线，加一点，或者减一点。

她合上抽屉，把信折好。第二天她照常上工，手指落在那根细绳上，比从前更轻了一些。

---

## Concept and field

**Steering Vectors / Activation Steering** belongs to the **interpretability and representation control** cluster of LLM research. It is a family of inference-time intervention techniques that modify a transformer's internal hidden states — adding or subtracting a fixed direction in activation space — to push model behavior toward or away from a target concept (sentiment, honesty, refusal, persona, topic) without any weight update.

## Key mechanism

The canonical recipe, formalized by Turner et al. (2023) as **Activation Addition (ActAdd)**:

1. Pick a contrastive prompt pair, e.g. `"Love"` vs `"Hate"`, or `"I am being honest"` vs `"I am lying"`.
2. Run a forward pass on each prompt and capture the residual-stream activation at a chosen layer ℓ and token position.
3. Compute the difference `v = h(positive) − h(negative)`. This vector `v` is the *steering vector*.
4. At inference time, on a new prompt, add `α · v` into the residual stream at the same layer ℓ during the forward pass. The scalar `α` controls intensity; sign controls direction.

Zou et al. (2023)'s **Representation Engineering (RepE)** generalizes this beyond a single pair: collect many stimulus/contrast pairs, take the leading PCA component of paired-difference activations (Linear Artificial Tomography, LAT), and use that direction both as a *reading* probe (does this concept appear in the residual stream?) and as a *control* direction. The mechanism rests on the **linear representation hypothesis** — that high-level concepts are encoded as roughly linear directions in activation space — so simple vector arithmetic in the right subspace is enough to nudge behavior.

## Why it matters

Steering is dramatically cheaper than fine-tuning: no labeled dataset, no gradient updates, no RLHF pipeline. A single pair of prompts can produce a usable behavioral knob within seconds, and the knob is continuously dial-able via `α`. It has become the workhorse intervention technique for mechanistic interpretability ("if removing this direction destroys the behavior, that direction *was* the behavior") and a candidate for lightweight alignment patches — e.g. inducing refusal, suppressing sycophancy, increasing honesty.

## Open questions and controversies

- **Brittleness and prompt-dependence.** Tan et al. and the *Steering off Course* line of work (2024–2025) show that steering vectors generalize poorly across prompts, models, and even random seeds; the same vector can be highly effective on some inputs and inert on others, and hyperparameters (layer, α) are unstable across model families.
- **Behavior composition fails.** Stacking multiple steering vectors often degrades coherence rather than producing the conjunction of behaviors.
- **Multi-turn decay.** The steering effect tends to wash out over several conversational turns, so persistent control requires re-injection at each forward pass.
- **Safety pitfalls.** *Analysing the Safety Pitfalls of Steering Vectors* (2024) documents that targeted steering can erode general safety alignment in unpredictable ways — a single direction may entangle honesty with harmfulness.
- **The linear representation hypothesis itself is contested.** Some concepts appear non-linearly encoded or distributed across multiple directions, which would mean steering only works for a privileged subset of behaviors.

## References

- Turner, A. M., Thiergart, L., Leech, G., Udell, D., Vazquez, J. J., Mini, U., & MacDiarmid, M. (2023). *Steering Language Models With Activation Engineering*. arXiv:2308.10248. <https://arxiv.org/abs/2308.10248>
- Zou, A., Phan, L., Chen, S., Campbell, J., Guo, P., Ren, R., … Hendrycks, D. (2023). *Representation Engineering: A Top-Down Approach to AI Transparency*. arXiv:2310.01405. <https://arxiv.org/abs/2310.01405>
- Tan, D., et al. (2024–2025). *Steering off Course: Reliability Challenges in Steering Language Models*. arXiv:2504.04635. <https://arxiv.org/html/2504.04635>
- Bartoszcze, L. *An Introduction to Representation Engineering — an activation-based paradigm for control of LLMs*. AI Alignment Forum. <https://www.alignmentforum.org/posts/3ghj8EuKzwD3MQR5G/an-introduction-to-representation-engineering-an-activation>
