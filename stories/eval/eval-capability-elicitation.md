---
id: eval-capability-elicitation
cluster: eval
concept: Capability Elicitation
status: done
sources:
  - https://arxiv.org/abs/2405.19550
  - https://arxiv.org/abs/2502.02180
  - https://aclanthology.org/2024.findings-emnlp.108/
generated_at: 2026-04-25
---

老周在城南开了三十年的钢琴行，店里收过一架旧的立式琴，是从一户搬走的人家拆来的。卖主只说："孩子不弹了，便宜处理。"老周敲了几个键，音准尚可，木板也没裂，便收下了。

他想转手卖掉，先请来一位街坊试琴。街坊是中学音乐老师，坐下弹了一段《致爱丽丝》，皱眉道："中音区有点闷，高音也散，不值什么钱。"老周心里一沉，挂了三千块的牌子摆在橱窗里。

半年没人问。

那年冬天，一个穿旧呢大衣的男人路过，进来站了很久。老周以为他要买，他却只是说："我能试试吗？"老周点头。男人坐下，没弹曲子，先用左手按了一个和弦，听了听；又把右脚踩在右踏板上，反复试那个延音的尾巴；接着他换了个姿势，把椅子往后挪了半尺，从最低音 A 一路敲到最高音 C，每个键都按到底，停留两秒。

他足足"调试"了二十分钟，一首完整的曲子都没弹。最后他坐直，弹了一段老周从没听过的曲子——不是炫技，是很慢的，让琴自己说话的那种。中音区不再闷，高音透亮，连那个被街坊嫌弃的延音都拖出一种叹息般的尾音。

老周愣住了："这……还是那架琴？"

男人笑了笑："是同一架。只是上一个人没找到它的脾气。每架旧琴都有自己习惯的力度、踏板的深浅、坐的位置。你用错了方法去问它，它就只会含糊地答你。"

老周不死心，第二天又请那位音乐老师来。老师再坐下，还是那段《致爱丽丝》，还是那句评语："中音区闷。"老周这才明白——琴没变，弹的人没变，问法也没变，于是答案永远不变。

他把价签从三千改成了一万二，加了一行小字："需懂行者。"

又过了一个月，琴行里来了一个戴眼镜的年轻人，自称在音乐学院做研究。他不试琴，反而问老周："您介意我把这架琴搬回学校三天吗？我们想用一种新办法——不是弹，是给它一段录音，让它跟着练，练完再听它怎么响。"老周犹豫了一下，签了押金条。

三天后琴搬回来，年轻人交还钥匙时说："这琴的真实水准，比您挂的牌子还要高出一截。我们让它'学会'了它原本就该会的事——只是从前没有人教过它怎么开口。"

老周把价签撕了，换上一张新的：

"此琴不卖。来者请坐，自试三十分钟，听它愿意为你说什么。"

---

## Concept and field

**Capability Elicitation** sits in the **evaluation** cluster of LLM research. It names the gap between what a model *can* do and what a given evaluation protocol *gets it to* do. A capability that exists inside the weights but is not surfaced by the prompt, the few-shot examples, the decoding temperature, or the answer-extraction regex will be scored as absent. Naive benchmarking therefore systematically *underestimates* models — sometimes by a wide and safety-relevant margin.

## Key mechanism

Three layers of the problem are now well-studied:

1. **Prompt sensitivity.** The same model can swing tens of points on MMLU-style benchmarks when the prompt template, option ordering, or few-shot example permutation changes. Lu et al. (2022) showed permutation alone changes accuracy from near-random to near-SOTA. Zhuo et al. (2024, *ProSA*) formalize this with a PromptSensiScore and find sensitivity correlates inversely with model confidence and shrinks with scale and few-shot context.
2. **Elicitation hierarchy.** Greenblatt et al. (2024) introduce **password-locked models** — LLMs deliberately fine-tuned to imitate a weaker model unless a secret password is in the prompt — as a stress test for elicitation methods. They show that a handful of high-quality demonstrations, or even RL with only an evaluator, can recover the hidden capability without ever seeing the password. Plain prompting often cannot.
3. **Comparing techniques.** Hofstätter et al. (2025, *The Elicitation Game*) extend this with circuit-breaking-trained model organisms and benchmark prompting vs. activation steering vs. fine-tuning. Prompting suffices for MCQA; activation steering largely fails; for harder generative tasks (e.g. code) only fine-tuning reliably elicits the latent capability. Combining methods helps.

The parable's "trying twenty minutes before playing" is prompt engineering and few-shot calibration; "letting the piano practice along with a recording" is fine-tuning-based elicitation; the music teacher who keeps repeating *Für Elise* is the static benchmark whose answer never updates because its question never does.

## Why it matters

If pre-deployment safety evaluations under-elicit, dangerous capabilities (bioweapons uplift, cyber, autonomous replication) may be wrongly judged absent. The same logic flips for capability marketing: a benchmark number is a *lower bound* on what a model can do, not a measurement. Treating evaluation as an *upper-bound problem* — what is the strongest elicitation we can mount against this model? — has become a cornerstone of frontier-model evaluation policy at Anthropic, DeepMind, and the UK AISI.

## Open questions

- When demonstrations of a capability are unavailable (because the model exceeds human ability), is RL-from-evaluator alone trustworthy? Greenblatt et al. flag this as the key limitation of fine-tuning-based elicitation.
- Can sandbagging-aware training (deceptive under-performance during eval) be detected by elicitation alone, or does it require interpretability?
- How should leaderboards report numbers — best-of-N elicitation, or a fixed protocol? The field has not converged.

## Key references

- Lu, Bartolo, Moore, Riedel, Stenetorp (2022). *Fantastically Ordered Prompts and Where to Find Them*. ACL.
- Greenblatt, Roger, Krasheninnikov, Krueger (2024). *Stress-Testing Capability Elicitation With Password-Locked Models*. https://arxiv.org/abs/2405.19550
- Zhuo, Zhang, Fang, Duan, Lin, Chen (2024). *ProSA: Assessing and Understanding the Prompt Sensitivity of LLMs*. EMNLP Findings. https://aclanthology.org/2024.findings-emnlp.108/
- Hofstätter, van der Weij, Teoh, Djoneva, Bartsch, Ward (2025). *The Elicitation Game: Evaluating Capability Elicitation Techniques*. ICML. https://arxiv.org/abs/2502.02180
