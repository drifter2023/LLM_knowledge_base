---
id: agent-tool-use
cluster: agent
concept: Tool Use / Function Calling (Toolformer, Gorilla, BFCL)
status: done
sources:
  - https://arxiv.org/abs/2302.04761
  - https://openreview.net/pdf?id=Yacmpz84TH
  - https://shishirpatil.github.io/publications/gorilla-2023.pdf
  - https://gorilla.cs.berkeley.edu/blogs/8_berkeley_function_calling_leaderboard.html
  - https://gorilla.cs.berkeley.edu/leaderboard.html
generated_at: 2026-04-25
---

少年沈识之自小被寄养在抄经院。院里规矩极严：每日抄一卷,字字不得错。沈识之记性好,十二岁便能背下整部地方志,可遇到帐目,他算"三百二十七乘十九",总要在心里盘桓半日,还常常出错。

抄经院隔壁是市集。市集上有算盘铺、有舆图铺、有问卜的老叟、有通译胡商语的女子,还有一座石钟,正点会自报时辰。沈识之每次去打水,都要从这五家店门前经过,可他从未进去过——师父说,抄经的人,心要静,不可外求。

直到某年春,新住持来了。新住持给沈识之一摞旧抄本,说:"你重抄一遍,但有一条新规矩。"

规矩是这样的:抄到任何一句话,沈识之都可以停笔,在旁边小字写一行——"此处去问算盘铺"或"此处去查舆图"。问完之后,把答案也誊在旁边。然后,他要把整段重新念一遍,看自己念下一句时,是否比从前更顺、更不打磕巴。

——若更顺,这一处停顿就保留;若念起来反而更生涩,或那答案根本无用,这一行小字就划掉,当作没问过。

头一个月,沈识之划掉了九成的小字。他什么都想问:抄到"春风"问算盘铺春风几斤几两,抄到"三百二十七乘十九"却忘了问。新住持不指点,只让他自己念,自己判。渐渐地,他学会了:遇到数字,该问算盘;遇到地名,该问舆图;遇到胡语,该问那女子;遇到"明日吉凶",问卜叟反而让下一句更别扭——因为吉凶本就不在原文里,问了是画蛇添足。

半年后,沈识之抄经,不再事事亲躬。他抄得比从前快,错得比从前少。新住持把他攒下的那些"留下的小字"汇成一册,拿去教别的徒弟——徒弟们不必再自己摸索,照着册子,便知何处该停、该问谁。

可问题来了。隔壁市集换了一批新铺子:算盘铺改成了西洋钟表铺,问卜叟的孙女接了班,舆图铺新进了几百卷海图。沈识之那本册子里写的是"问东街第三家",可东街第三家已经不卖算盘了。他照着旧册去问,问出一堆牛头不对马嘴的答案。

新住持笑了,又给他一项新差事:每日清晨,先去市集走一遭,把当日开门的铺子、各铺的招牌和它们卖什么,抄成一张活页,夹在册子最前。抄经时,他先翻活页,再决定去问谁。这样,哪怕铺子换了一百次,他的判断也跟着换。

又过一年,州府要评比抄经院。考官不只考一句一问,还考连环问——问完算盘再问舆图,问完舆图再回头问算盘对不对;还故意夹一些根本没有铺子能答的怪题,看抄经人会不会硬塞一个铺子的名字进去充数。沈识之这才知道,从前他以为自己学得很好,其实只学会了一句一问;遇到要记住前一问的答案、再据此决定下一问的题目,他还是会乱;遇到本不该问的题目,他也会忍不住问一句,反而把句子搞坏。

他低头,继续抄。

---

## Concept and Field

**Tool Use / Function Calling** sits in the **agent** cluster of LLM research. It studies how a language model can be taught to recognize, at the right token, that an external resource — a calculator, a search index, a REST API, a Python interpreter — would predict the next token better than the model alone, and then to emit a structured call, consume the returned result, and continue generation.

## Key Mechanism

Three landmarks define the modern picture:

1. **Toolformer (Schick et al., 2023, NeurIPS).** A self-supervised pipeline with three stages: (a) **sample** candidate API calls at every position of an unlabeled corpus by prompting the base LM with a few demonstrations; (b) **execute** the calls; (c) **filter by loss reduction** — keep a call only if the weighted cross-entropy of the subsequent tokens, conditioned on the call *and its result*, is lower (by at least a threshold τ) than the loss without the call or with the call but no result. The surviving annotations are folded back into the training corpus, and the LM is fine-tuned on this self-generated, self-validated data. The filter is the conceptual heart: tool use is learned only where it demonstrably helps next-token prediction.

2. **Gorilla (Patil et al., 2023, NeurIPS 2024).** Where Toolformer handles a handful of APIs, Gorilla targets *thousands*. The authors build **APIBench** from HuggingFace, TorchHub, and TensorHub, and propose **Retriever-Aware Training (RAT)**: during fine-tuning, the model is conditioned on documentation snippets returned by a retriever, so at inference it can absorb a swapped-in or updated API doc instead of memorizing call signatures. This directly mitigates hallucinated arguments and lets the model track a changing API zoo.

3. **Berkeley Function Calling Leaderboard (BFCL, Patil et al., 2024–2025).** The de-facto evaluation harness. It scores models with an **Abstract Syntax Tree (AST) checker** on simple, multiple, parallel, and parallel-multiple calls; with **execution-based** checks where feasible; and with **relevance / irrelevance detection** — refusing to call a tool when none applies. BFCL V3 added **multi-turn / multi-step** evaluation; V4 added **agentic** scenarios (memory, long-horizon decisions). The headline finding: top models ace single-turn calls but degrade sharply on multi-turn state-tracking and on knowing when *not* to call.

## Why It Matters

Plain LLMs are notoriously brittle on arithmetic, fresh facts, and domain APIs. Tool use turns the LM into a *router* over reliable specialists, decoupling reasoning from rote competence. It is the substrate beneath every modern agent framework, ChatGPT plugins, and the OpenAI/Anthropic function-calling APIs.

## Open Questions / Controversies

- **Multi-turn collapse.** BFCL V3/V4 results show that single-turn AST scores massively overstate real agent capability; multi-turn function-calling remains an open problem.
- **Irrelevance detection.** Models over-call: given a tool, they tend to use it even when the prompt doesn't warrant one. This is a structural failure of the loss-reduction objective, which only rewards helpful calls and never explicitly penalizes spurious ones outside the training distribution.
- **Benchmark contamination.** BFCL V2 (Aug 2024) was released in part to address contamination and bias in V1; the leaderboard's own maintainers caution that AST scores can be gamed by memorizing schema patterns.
- **Toolformer vs. in-context tool use.** Whether self-supervised fine-tuning is still worth it given that GPT-4-class models can use tools zero-shot from the schema alone is an open empirical question; Gorilla's retrieval-augmented approach is widely seen as the more scalable path.

## Key References

- Schick, T. et al. (2023). *Toolformer: Language Models Can Teach Themselves to Use Tools.* NeurIPS. https://arxiv.org/abs/2302.04761
- Patil, S. G., Zhang, T., Wang, X., Gonzalez, J. E. (2023). *Gorilla: Large Language Model Connected with Massive APIs.* NeurIPS 2024. https://arxiv.org/abs/2305.15334
- Patil, S. G. et al. (2025). *The Berkeley Function Calling Leaderboard (BFCL): From Tool Use to Agentic Evaluation of Large Language Models.* ICML. https://gorilla.cs.berkeley.edu/leaderboard.html
