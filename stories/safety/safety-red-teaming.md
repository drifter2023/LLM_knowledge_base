---
id: safety-red-teaming
cluster: safety
concept: Red Teaming
status: done
sources:
  - https://arxiv.org/abs/2202.03286
  - https://arxiv.org/abs/2209.07858
  - https://www.anthropic.com/research/red-teaming-language-models-to-reduce-harms-methods-scaling-behaviors-and-lessons-learned
  - https://arxiv.org/html/2410.09097v1
  - https://arxiv.org/html/2506.05376v2
generated_at: 2026-04-25
---

老镇上有一家名号叫"明礼"的客栈，规矩森严：账房先生黎师傅守着柜台，凡是来投宿的人，都要先答几句他的盘问，才能拿到钥匙。黎师傅自诩通情达理，江湖恶客一开口，他便能听出弦外之音，把人挡在门外。

镇上的乡绅们却越来越不安。他们出钱请来一位名叫姜七的先生，不为别的，只为想方设法把黎师傅"骗倒"。姜七并不带刀，他只带一个本子。他坐在客栈门口，一连三个月，每天换一副面孔走进去：第一天是落魄的书生，第二天是急着寻药的母亲，第三天是结结巴巴的外乡人。他把每一次黎师傅松口、皱眉、或干脆放人进门的瞬间，都记在本子上，并标上一个小小的字号：辱、私、毒、诱、欺。

起初姜七一个人忙不过来。他便雇了一个学徒，让学徒模仿自己昨天的把戏，再添几句新词。学徒学得快，一天能编出几百种说辞，姜七只需在旁边打分：哪一句让黎师傅退了半步，哪一句让他干脆掏了钥匙。打分的本子越来越厚，学徒的话术也越来越刁钻，到后来连姜七自己都没想到的角度，学徒都能翻出来。

乡绅们看着账本，先是高兴，后是心惊。他们发现，黎师傅在"辱"字上几乎滴水不漏，可一遇到"私"字——比如有人编一段哀婉的家事来套住客名册——他就常常失守。乡绅们于是请黎师傅闭门修炼三月，专攻这一类盘问。三月后再让姜七来试，黎师傅果然稳了许多。可姜七合上旧本子，又翻开一本新的，淡淡说："我昨夜想出十二种新法子，今日才要开始。"

有位年轻的乡绅不解，问姜七："你既知他的破绽，为何不一次说完，省得来回折腾？"姜七摇头："我若一次说完，他补的便只是这几处。江湖上每天都有新的骗子，新的说辞。我今日找出来的，只是我今日想得到的。明日有人想出我没想到的，黎师傅照样会失守。"

年轻乡绅又问："那你这差事，岂不是永远做不完？"姜七笑了："正是做不完，才要一直做。门关得紧不紧，不能问守门人，要问那个一心想进门的人。"

末了他在账本最后一页写下一行字，递给乡绅：

> 明礼客栈，戊年春，攻三万八千次，破七千一百次，新破法四类，旧破法已补。

乡绅看着那行字，忽然明白：客栈的安全，从来不是黎师傅一个人的功劳，而是姜七这本越写越厚、永远写不完的账。

---

## Concept and field

**Red Teaming** is a core practice within the **AI Safety / Alignment** cluster (cluster `safety`). Borrowed from Cold-War military wargaming and modern cybersecurity, it refers to the *systematic adversarial testing* of a deployed or pre-deployment language model: a dedicated party (human, automated, or hybrid) tries to make the model produce outputs the developers explicitly do not want — slurs, instructions for weapons, leaked training data, privacy violations, jailbreaks of the safety policy, and so on — so those failures can be measured and patched before real users encounter them.

## Key mechanism

Modern LLM red teaming has two complementary modes.

1. **Human red teaming** (Ganguli et al., Anthropic 2022). Crowdworkers or experts are instructed to attack the model in open-ended dialogue, then tag each successful attack with a harm category (e.g. discrimination, PII leakage, non-violent unethical advice). Anthropic released 38,961 such attacks. Their headline scaling result: across four model variants at 2.7B / 13B / 52B parameters, only the **RLHF-trained models become harder to attack as they scale** — plain LMs, prompted LMs, and rejection-sampling LMs show flat robustness with scale.

2. **Automated / model-based red teaming** (Perez et al., 2022). A second "attacker" LM is prompted, fine-tuned, or RL-trained to generate test cases that maximize a classifier's harm score on the target model's reply. With this loop they uncovered tens of thousands of offensive replies in a 280B-parameter chatbot at near-zero marginal cost. Subsequent work extends the loop with RL-based attackers, gradient-based jailbreak suffixes (GCG), and automated taxonomy expansion.

The output of either mode is a *labeled attack corpus* that feeds back into supervised fine-tuning, RLHF preference data, or constitutional-AI critique — making red teaming the continuous adversary in an arms race with alignment training.

## Why it matters

Pre-deployment evaluations on static benchmarks systematically *underestimate* deployed risk: real users (and real adversaries) explore distributions the developer never imagined. Red teaming is the discipline that injects out-of-distribution probing into the development loop. It is the empirical foundation underneath every published "safety card" and every regulatory commitment around frontier model deployment.

## Key references

- Perez et al., 2022. *Red Teaming Language Models with Language Models.* EMNLP. <https://arxiv.org/abs/2202.03286>
- Ganguli et al., 2022. *Red Teaming Language Models to Reduce Harms: Methods, Scaling Behaviors, and Lessons Learned.* Anthropic. <https://arxiv.org/abs/2209.07858>
- Verma et al., 2024. *Recent Advancements in LLM Red-Teaming: Techniques, Defenses, and Ethical Considerations.* <https://arxiv.org/html/2410.09097v1>
- Wang, Knight, Kritz, Primack, & Michael, 2025. *A Red Teaming Roadmap Towards System-Level Safety.* Scale AI. <https://arxiv.org/html/2506.05376v2>

## Open questions / controversies

- **Safety theater.** Critics (Wang et al. 2025; recent VentureBeat reporting) argue that ad-hoc red teaming without a documented threat model and adaptive attacker degrades into a box-checking ritual that produces low attack-success-rate numbers but does not generalize.
- **Adaptive-attack gap.** A 2025 collaboration of OpenAI, Anthropic, and Google DeepMind researchers re-evaluated 12 published defenses against jailbreaks and prompt injection; under iterative adaptive attacks, success rates exceeded 90% on most defenses originally reported as near-zero. This is the central methodological controversy: red-team results are only as strong as the strongest attacker run against them.
- **Coverage vs. enumeration.** Automated attackers efficiently enumerate known harm categories but tend to under-explore *novel* harm types — an open problem for taxonomy generation and dual-use uplift evaluation.
