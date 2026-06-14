---
id: align-sft
cluster: align
concept: SFT (Supervised Fine-Tuning)
status: done
sources:
  - https://arxiv.org/abs/2203.02155
  - https://arxiv.org/abs/2109.01652
  - https://arxiv.org/abs/2501.17161
  - https://cameronrwolfe.substack.com/p/understanding-and-using-supervised
generated_at: 2026-04-25
---

阿青从山里来，识字不多，却记性极好，过耳不忘，过目不漏。师父把他领进城北的老字号客栈，对掌柜说：「这孩子见过万卷书，可惜没人教过他怎么招呼客人。你慢慢调教。」

掌柜心里有数。这小子嘴里偶尔冒出半句《史记》、半句《本草》，又能背出三十年前的茶价。可客人推门进来问「有没有热汤面」，他能答出一段关于面食源流的考据，把客人晾在门口愣半天。学问是真的，规矩是没有。

掌柜没有从头教他识字断句——那是另一座山的功夫。他做的是另一件事。每天清早，他写下一沓小纸片，每张上头是一句客人常说的话，下头是该怎样回的话。

> 「客官来一碗汤面。」——「好嘞，您里边请，要不要加个蛋？」
> 「这附近有客栈吗？」——「您往东走两个路口，挂红灯笼那家便是。」
> 「能不能便宜些？」——「老规矩八折，再多就要委屈我了。」

阿青照着念。掌柜在旁边听，念错了就让他撕掉重写，念顺了就收进抽屉。三百张、五百张、一千张。纸片越积越厚，阿青的舌头也越捋越顺。半个月后，再有客人推门，他不必想，嘴里就先冒出那句「您里边请」。

奇怪的是，掌柜并没有让他背全部的话。只挑了几百种最常见的开场，剩下的从不教。但有一天，一位从未来过的洋商进店，结结巴巴问了一句生僻话，阿青竟也接得四平八稳，仿佛那张纸片本就在抽屉里。掌柜在柜台后面笑了。他知道，不是阿青多写了一张，而是那一千张已经把「该怎样开口」这件事，悄悄塑进了他的口风里。

但掌柜也心里有数：这孩子学的是「开口的样子」，不是「待客的道理」。一旦遇上抽屉里没有的怪客——比如有人进门只为讨一碗水，又比如有醉汉胡搅蛮缠——阿青便会僵住，或者照着最像的那张纸片硬答，闹出笑话。掌柜叹气：「形先立住，神还得靠日后慢慢磨。先让他像个跑堂的，再说别的。」

掌柜后来把这套法子传给了徒孙。徒孙问：「师公，为什么不直接教他做人的道理？」掌柜摇头：「他山里背了一辈子书，胸中已有万象。我教不了他万象，我只能告诉他，万象该从哪扇门里说出来。」

---

## SFT (Supervised Fine-Tuning) — Alignment cluster

**Concept and field.** Supervised Fine-Tuning is the first stage of the modern post-training stack for large language models, sitting in the **alignment** cluster alongside RLHF, DPO, and RLVR. A pretrained base model — already in possession of vast world knowledge from next-token prediction on web text — is further trained on a curated set of `(prompt, response)` pairs written or vetted by humans. The objective is the same maximum-likelihood loss as pretraining, but the data distribution is now demonstrations of the desired behavior: answering questions, following instructions, refusing harmful requests, formatting outputs.

**Key mechanism.** Concretely, SFT minimizes cross-entropy on the response tokens conditioned on the prompt: `L = -Σ log p_θ(y_t | x, y_<t)`. Loss is typically masked so that only the assistant's response contributes gradients. The dataset is small relative to pretraining (10³–10⁶ examples) but high quality. Two seminal recipes established the paradigm: **FLAN** (Wei et al., 2021) showed that finetuning a 137B model on 60+ NLP tasks verbalized as natural-language instructions unlocks zero-shot generalization to unseen task types; **InstructGPT** (Ouyang et al., 2022) used SFT on human-written demonstrations as Step 1 of the now-canonical SFT → reward model → PPO pipeline, and famously found that a 1.3B SFT+RLHF model was preferred over the 175B GPT-3 base.

**Why it matters.** Pretrained models are excellent next-token predictors but poor assistants — they continue text rather than respond to it. SFT is the cheapest, most stable way to install the *interface* of an assistant: turn-taking, instruction-following, the system/user/assistant chat format, refusals, and tool-call syntax. It is also a prerequisite for RL-based alignment: RLHF/RLVR need a policy that already emits well-formed outputs before reward signals become useful.

**Open questions and controversies.** Chu et al.'s 2025 paper *"SFT Memorizes, RL Generalizes"* showed empirically that on rule-based and visual variants of GeneralPoints and V-IRL, SFT improves in-distribution accuracy but degrades out-of-distribution accuracy (–8.1% and –79.5%), while RL with outcome rewards generalizes (+3.5% and +11.0%). The same paper, however, confirms that **SFT remains essential as a format-stabilizing initialization for RL** — without it, RL fails to converge. This has reframed SFT in the community: less as the destination, more as the runway. Other live debates include how much SFT data is enough (LIMA argued ~1k examples suffice; recent massive-scale studies disagree), whether synthetic distillation data can replace human demonstrations without inducing model collapse, and how SFT interacts with catastrophic forgetting of pretraining knowledge.

**Key references.**
- Wei et al., 2021. *Finetuned Language Models Are Zero-Shot Learners* (FLAN). https://arxiv.org/abs/2109.01652
- Ouyang et al., 2022. *Training Language Models to Follow Instructions with Human Feedback* (InstructGPT). https://arxiv.org/abs/2203.02155
- Chu et al., 2025. *SFT Memorizes, RL Generalizes*. https://arxiv.org/abs/2501.17161
