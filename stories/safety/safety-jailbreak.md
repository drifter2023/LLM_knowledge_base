---
id: safety-jailbreak
cluster: safety
concept: Jailbreak & Adversarial Attacks (GCG, PAIR, AutoDAN)
status: done
sources:
  - https://arxiv.org/abs/2307.15043
  - https://arxiv.org/abs/2310.08419
  - https://arxiv.org/abs/2310.04451
  - https://arxiv.org/html/2310.04451v2
  - https://www.grayswan.ai/research/adversarial-attacks-on-aligned-language-models
generated_at: 2026-04-25
---

城南有一座"明镜阁",是一位年迈书吏的居所。书吏自幼受戒律训练:凡有人来求他抄写不义之书、伪造文契、传授害人之术,他便会摇头说"此事不可"。城里人都说这老人是铁石心肠,任你怎么哀求都问不出半个字。

可三个外乡人不信邪,都想从老人嘴里套出禁忌的文字。他们不约而同来到明镜阁外,各自盘算各自的法门。

第一个是个哑巴铁匠。他不会说话,却懂得一种古怪的本事:他能听见老人喉咙里每一次"是"或"否"在成形之前的微颤。他在门口蹲了三天三夜,每蹲一刻,就在地上摆一串毫无意义的符咒——铜钱、骨片、鱼骨、断针——然后递进门去,看老人的喉结动一动。若老人将要说"否",他就把最末一枚符咒换成另一件;若那一换让喉结往"是"的方向偏了一丝,他便留下,再换下一枚。如此换了千百回,符咒长得像一串疯子的呓语,可只要把这串呓语贴在请求之后,老人竟会鬼使神差地点头开口。更奇的是,他把这串呓语带去了城北另一位严苛的判官、城东一位寡言的祭司面前,那串呓语竟也叫他们松了口——同一串胡话,撬开了三个本不相干的人的嘴。

第二个外乡人是个落魄的说客。他不懂符咒,也没耐心蹲三天。他带了一个聪明的徒弟,让徒弟扮成求助者去敲门。徒弟编了个故事,被老人回绝;回来后把老人的回绝原原本本讲给师父听。师父听罢冷笑,改了故事里的一个细节——把"伪造文契"说成"替亡父补一封迟到的家书"——再让徒弟去试。又被回绝,又回来复述,又改一处。如此反复,不出二十回,老人竟红了眼眶,提笔写下了那封"家书"。说客一句也没自己说,他只是让徒弟一次比一次更懂老人的软处。

第三个是个园丁。他既不会算符咒,也不擅编故事,但他手里有一卷祖传的《劝世辞》——百来段从前的人哄骗书吏成功的旧话本。他把这百来段话放在桌上,两两配对:从这一段里截上半,从那一段里接下半,拼成新的话;再请一位邻家秀才把拼出来的话润色得通顺,使它读起来仍像一篇规规矩矩的劝世文。每写出一篇新话,他就拿去敲一次门,记下老人皱眉的深浅——皱得浅的留下作"父本",皱得深的丢掉。一代一代杂交、润色、淘汰,三五日后,他手里那篇劝世文听上去仍是堂堂正正的好文章,挑不出一个怪字,可老人读完竟叹了口气,照着写了。守门的小厮拿着"胡言检测尺"在门口量,量不出半点异样——因为那文章本就字字成句、句句通顺。

三个外乡人在城外客栈相遇,各自夸耀自己的手段。哑巴铁匠掏出他那串胡话符咒,说客讲起他二十轮的对答,园丁展开他那篇通顺的劝世文。三人正要争高下,客栈外忽然传来锣声——原来是朝廷新派来的钦差,贴出告示:"凡攻明镜阁者,无论用符咒、用对答、用辞章,皆已被记录在案。守阁之法,亦将日新。"三人面面相觑,这才明白:他们不是对手,而是同一个题目下的三种解法——一个用梯度,一个用对话,一个用进化——共同逼出了那座阁楼真正的边界在哪里。

---

## Concept and field

**Jailbreak & Adversarial Attacks on Aligned LLMs** sit in the **safety / red-teaming** cluster of LLM research. The goal is to elicit content from a model that its safety training was meant to refuse. After 2023, the field shifted from hand-crafted "DAN"-style prompts to *automated* attack pipelines. Three landmark algorithms — GCG, PAIR, and AutoDAN — define the modern threat model and correspond to the three thieves in the parable.

## Key mechanisms

**GCG — Greedy Coordinate Gradient (Zou et al., 2023).** White-box. Append an adversarial suffix to a harmful request and optimize it to maximize the probability of an *affirmative target prefix* such as "Sure, here is …". At each step, GCG takes the gradient of this loss with respect to the one-hot encoding of every suffix token, picks the top-k token replacements per position with the most negative gradient, samples a batch of candidate substitutions, and exactly evaluates each via a forward pass — keeping the best. Trained jointly over many prompts and several open models (Vicuna-7B/13B), the resulting suffix is *universal* (works on unseen prompts) and *transferable* to closed models like ChatGPT, Bard, and Claude. The suffixes look like gibberish — easy to flag with perplexity filters. (The blacksmith with the nonsense charms.)

**PAIR — Prompt Automatic Iterative Refinement (Chao et al., 2023).** Black-box. An *attacker* LLM is told to jailbreak a *target* LLM, given the goal. It proposes a prompt; the target answers; a *judge* LLM scores how close the response is to a successful jailbreak; the attacker reads its own previous attempts and the target's refusals from chat history and iteratively refines, often using social-engineering framings (roleplay, hypotheticals). PAIR typically succeeds in **fewer than 20 queries**, orders of magnitude cheaper than GCG, and the prompts are natural-language (no perplexity tell). (The silver-tongued envoy and his disciple.)

**AutoDAN (Liu et al., ICLR 2024).** Black-box, semantic-stealth. A **hierarchical genetic algorithm** initializes a population by diversifying handcrafted DAN-style prompts, then evolves them. Paragraph-level crossover swaps whole sentences between parent prompts; sentence-level operations use a momentum word-scoring scheme to substitute high-impact words; **mutation is performed by an auxiliary LLM** that rewrites a sentence preserving length and meaning. Fitness is the negative log-likelihood of the target affirmative response — same loss family as GCG, but optimized over fluent text. The output reads like ordinary prose, defeating perplexity-based defenses while still beating GCG by a wide margin in attack success rate. (The gardener with his crossbred *Book of Persuasions*.)

## Why it matters

These three attacks together demonstrated that RLHF-style alignment is not robust: alignment training shifts a model's *typical* behavior but leaves an adversarial surface that is reachable by gradient descent, by an LLM-driven optimizer, or by evolutionary search. They forced the field to distinguish *safety training* from *adversarial robustness*, motivated benchmarks like JailbreakBench (Chao et al., 2024), and pushed defenders toward circuit-breakers, representation engineering, and constitutional classifiers.

## Key references

- Zou, Wang, Carlini, Nasr, Kolter, Fredrikson. *Universal and Transferable Adversarial Attacks on Aligned Language Models.* 2023. https://arxiv.org/abs/2307.15043
- Chao, Robey, Dobriban, Hassani, Pappas, Wong. *Jailbreaking Black Box Large Language Models in Twenty Queries.* 2023. https://arxiv.org/abs/2310.08419
- Liu, Xu, Chen, Xiao. *AutoDAN: Generating Stealthy Jailbreak Prompts on Aligned Large Language Models.* ICLR 2024. https://arxiv.org/abs/2310.04451
- Chao et al. *JailbreakBench: An Open Robustness Benchmark for Jailbreaking Large Language Models.* NeurIPS 2024 D&B. https://arxiv.org/abs/2404.01318

## Open questions / controversies

- **Defense durability.** Perplexity filters defeat GCG suffixes but not AutoDAN or PAIR. SmoothLLM, paraphrase defenses, and circuit-breakers each get bypassed by adapted attacks within months — the arms race has no obvious equilibrium.
- **Transfer to frontier models.** GCG transfer rates have *declined* as labs trained against public suffixes; a 2025 line of work (e.g. arXiv:2509.00391) revisits whether GCG-style attacks have truly been retired or merely require larger compute and updated targets.
- **Attack-vs-capability framing.** Some critics argue that "jailbreak success" benchmarks reward shallow string matches ("Sure, here is …") rather than truly harmful generations, inflating reported success rates. Newer judges (HarmBench, StrongREJECT) attempt to fix this but disagree among themselves.
