---
id: eff-quantization
cluster: eff
concept: Quantization (GPTQ / AWQ / SmoothQuant)
status: done
sources:
  - https://arxiv.org/abs/2210.17323
  - https://arxiv.org/abs/2306.00978
  - https://arxiv.org/abs/2211.10438
  - https://aakashvarma.substack.com/p/smoothquant
  - https://github.com/mit-han-lab/llm-awq
generated_at: 2026-04-25
---

景德镇的老瓷厂要搬迁。新厂房只有旧厂房四分之一大,可三代人攒下的几十万只素胎、釉料桶、模具和半成品,一件都不能丢——东家说,丢了哪一件,出窑的成色就不再是从前的成色。

总管事姓周,愁了三宿。第三天清早,他召来三位老伙计,各派一桩差事。

第一位是账房沈先生。沈先生从不进窑房,只翻账本。他说:"东西多,可不是每件都值钱。咱们一摞一摞地搬——搬一摞,我就翻一次损益账,看这一摞里哪几件压秤压得最厉害,把它们留在原位不动,旁边的轻件挪过去填空。挪完再翻账,如此一摞接一摞往下推。"伙计们嫌他磨蹭。沈先生笑:"我这叫顺着账面的曲度走。每搬完一摞,后头那些摞的账就跟着变了,我得重新算。算一次,挪一次,绝不回头。"果然,等他用这套法子把西院搬完,釉色一分未失,而那本损益账,他借了一块上好的料板,先把整页折算清楚,再依次往下落笔,从不重复推演。

第二位是窑工老郑。老郑不识字,可他常年看坯,眼睛毒。他蹲在素胎堆前,不去摸坯,反倒去摸火膛里残留的灰。"哪一炉灰最厚,说明那一炉里的活儿被人用得最多。用得多的,釉就敏感,不能糙搬。"他挑出全场百分之一的素胎,在它们底下垫了厚棉,又把棉的厚度按"灰的多寡"调好——灰厚的垫得高,搬动时颠簸就被棉吃掉了。旁人问:"剩下九成九呢?"老郑说:"剩下的,粗麻袋一兜便是。"东家来验,发现出窑的釉色,跟那百分之一被精心保护的素胎严丝合缝——原来一炉成色,真就靠那一小撮敏感件撑着。

第三位是搬运头阿宽。阿宽手底下二十个壮工,可他发愁的不是壮工,是釉料桶。釉料桶里有几桶是百年祖传的"烈釉",一颠就泼,一泼就废;而素胎本身倒结实。阿宽想了个主意:他让伙计们把烈釉先匀一瓢到对应的素胎上——素胎吸了釉,变沉了一点,但整体重量不变,釉桶却从此不烈了,随便颠。搬到新厂,再让素胎把那一瓢釉吐回桶里,分毫不差。东家不解:"你这不是多此一举?"阿宽答:"烈的难搬,钝的好搬。我把'烈'从釉里挪一半到坯里,两边就都成了钝的。挪多挪少有个准头——挪七分钝坯还撑得住,挪三分釉桶还是烈,得挑那个两边都松快的中点。"

三个法子并行。沈先生的账册、老郑的棉垫、阿宽的匀釉,在新厂房里合成一道窑。开窑那日,东家捧出第一只青瓷,对着光看了许久,说:"四分之一的地方,装下了从前十成的成色。少了的那六分,是空的,不是缺的。"

——

## English Explanation

**Concept and field.** *Quantization* for large language models — specifically the post-training quantization (PTQ) family represented by **GPTQ**, **AWQ**, and **SmoothQuant**. This sits in cluster `eff` (efficiency / inference systems). The shared goal: take a model trained in FP16/BF16 and represent its weights (and sometimes activations) in INT8, INT4, or FP4, so it fits in a quarter of the memory and runs faster on commodity GPUs, with negligible quality loss.

**Three mechanisms, three characters.**

1. **GPTQ (Frantar et al., 2022)** — the accountant Shen. GPTQ quantizes one column of a weight matrix at a time. After each column is rounded, it uses the layer's input Hessian H = 2 X Xᵀ to compute a closed-form *compensation update* on all remaining unquantized columns, redistributing the rounding error along the curvature of the loss surface. The trick that makes it scale to 175B parameters in hours is to precompute the Cholesky factor of H⁻¹ once per layer and walk through columns in a fixed order, so the algorithm never revisits a column. This is a direct descendant of Optimal Brain Surgeon (OBS) / Optimal Brain Quantization (OBQ), made tractable by replacing greedy column selection with a fixed sweep.

2. **AWQ (Lin et al., MLSys 2024 Best Paper)** — the kiln-worker Zheng who reads the *ash*, not the clay. AWQ's insight is that not all weight channels matter equally; the salient ones (~1%) are identified not by weight magnitude but by the magnitude of the *activations* that flow through them. AWQ then applies a per-channel scale `s` so that the salient channels are multiplied up before quantization (and the corresponding activations scaled down by 1/s); after rounding, the salient channels suffer relatively less precision loss. There is no backprop and no calibration-set reconstruction, which is why AWQ generalizes across domains.

3. **SmoothQuant (Xiao et al., ICML 2023)** — the foreman Kuan who decants volatile glaze. Activations in LLMs have a few catastrophic outlier channels (especially after LayerNorm + GELU), making INT8 activation quantization brittle. SmoothQuant defines a per-input-channel scale `s_j = max(|X_j|)^α / max(|W_j|)^(1−α)` and rewrites `Y = (X · diag(1/s)) · (diag(s) · W)`. This is mathematically identical, but the activation outliers are partly absorbed into the weights. The hyperparameter α (typically 0.5) is the "sweet spot" that leaves both sides quantization-friendly. This unlocks W8A8 inference where prior methods could only do W8A16.

**Why it matters.** Without these techniques, a 70B model needs ~140 GB of weight memory in FP16 — multiple datacenter GPUs. With INT4 weight quantization (GPTQ/AWQ) it drops to ~35 GB and runs on a single consumer card; with W8A8 (SmoothQuant) inference throughput rises ~1.5× because INT8 tensor cores are faster than FP16. The entire local-LLM ecosystem (llama.cpp, vLLM AWQ kernels, TensorRT-LLM) rests on this trio.

**Open questions.** (i) Sub-4-bit territory — INT2/INT3 — still degrades reasoning and long-context performance disproportionately; recent work like QuIP# and AQLM uses lattice codebooks rather than uniform grids. (ii) Activation quantization for very long contexts: the outlier story shifts when KV-cache itself must be quantized. (iii) FP4 (NVFP4 / MXFP4) on Blackwell hardware reopens the question of whether integer or floating-point low-bit formats are preferable; AWQ-style salience analysis interacts non-trivially with FP4's non-uniform grid.

## References

- Frantar, E., Ashkboos, S., Hoefler, T., & Alistarh, D. (2022). *GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers.* ICLR 2023. https://arxiv.org/abs/2210.17323
- Lin, J., Tang, J., Tang, H., Yang, S., Chen, W.-M., Wang, W.-C., Xiao, G., Dang, X., Gan, C., & Han, S. (2023). *AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration.* MLSys 2024 (Best Paper). https://arxiv.org/abs/2306.00978
- Xiao, G., Lin, J., Seznec, M., Wu, H., Demouth, J., & Han, S. (2022). *SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models.* ICML 2023. https://arxiv.org/abs/2211.10438
- MIT Han Lab. *llm-awq* reference implementation. https://github.com/mit-han-lab/llm-awq
- Varma, A. *SmoothQuant: smoothing systematic outliers in LLMs for efficient quantization* (technical walkthrough of the α formula). https://aakashvarma.substack.com/p/smoothquant
