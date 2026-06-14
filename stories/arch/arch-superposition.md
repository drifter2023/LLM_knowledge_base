---
id: arch-superposition
cluster: arch
concept: Superposition & Polysemanticity
status: done
sources:
  - https://transformer-circuits.pub/2022/toy_model/index.html
  - https://arxiv.org/abs/2209.10652
  - https://www.lesswrong.com/posts/8EyCQKuWo6swZpagS/superposition-is-not-just-neuron-polysemanticity
generated_at: 2026-04-25
---

镇上只有十二个抽屉。

这是清吏司给小县城的全部家当。十二个抽屉,要装下全县三百多种文书:婚书、田契、讼状、税册、行医的执照、走船的凭引、白事的报丧、祠堂的香火簿。新上任的录事姓沈,他第一天就发现前任在抽屉外面贴了密密麻麻的小条:"婚书在三号、五号、九号","田契在三号、七号、十一号","讼状在五号、八号、十二号"。

沈录事看不懂。他问老吏。

老吏笑:"你别看一个抽屉里塞着不相干的东西。要紧的是——同一天里,镇上不会同时来办婚事、打官司、又报白事。婚书一来,五号抽屉就只是婚书的五号;明日有人闹田界,五号抽屉就只是田契的五号。东西虽挤在一处,却从不同时开口讲话。"

沈录事将信将疑,试了几个月,竟真行得通。镇子小,人事稀,一日里能用上三种文书已属热闹。十二个抽屉,愣是当四十个用。每种文书在抽屉里占的不是某一格,而是某几格的一种"配比"——三号放七分、七号放两分、十一号放一分,合起来才是"田契"。别的文书也各有自己的配比,彼此的配比几乎不重合,像十二维空间里几乎垂直的箭头,只要不同时拔出来,就互不打架。

风调雨顺了几年,县里人丁渐旺。某个秋日,城东办喜事,城西打田官司,北街又来报丧——三件事撞在同一个时辰。沈录事去开抽屉,五号里婚书的红、田契的黄、讼状的青,搅成一团。他读出来的婚书上沾着田界的方位,讼状里混进了"三书六礼",报丧的人当场翻脸。

那一夜沈录事在油灯下重抄。他终于明白:抽屉之所以够用,不是因为抽屉多,而是因为镇子稀。镇子一稠,抽屉就要现原形——挤在一处的东西,会同时开口,讲出谁也听不懂的话。

他写信给上司,请添抽屉。上司回信只问一句:"你那十二个抽屉,平日里每一格,究竟是装什么的?"

沈录事提笔,半晌写不出。每一格里,似乎什么都装过,又似乎什么都不专属。他想给五号取个名字,想了一夜,只想出一句话:

"它不是某一样东西的格子。它是好几样东西,趁彼此不在场时,轮流借住的格子。"

写完这句,他忽然觉得,这十二个抽屉,和他这些年读过的、那些据说"看一眼神经元就懂模型"的文章,讲的是同一件事。

---

## Superposition & Polysemanticity

**Field.** Mechanistic interpretability of neural networks; cluster `arch` (representation geometry inside transformers).

**Mechanism.** A network with `d` hidden dimensions can, in principle, represent only `d` orthogonal features. Empirically, trained models seem to represent *many more* than that. Elhage et al. (2022) formalize this with a toy autoencoder: synthetic features are sparse (each one active only a small fraction of the time) and the network is forced through a bottleneck `W ∈ ℝ^(d × n)` with `n ≫ d`. The optimal solution is not to drop the extra features but to embed them as **near-orthogonal directions** in the `d`-dimensional space — accepting small inner-product "interference" between features in exchange for representing all `n` of them. The interference cost scales with how often two features co-activate; when features are sparse, expected collisions are rare, so the network packs them in. This packing is **superposition**.

A direct consequence: any single neuron (basis direction) lies on the projection of *many* feature directions, so it fires on multiple unrelated concepts. That observed behaviour is **polysemanticity**.

The toy model also exposes a **phase change** controlled by feature sparsity and importance: as sparsity increases, the network transitions from "dedicate one direction per feature" to "share directions across features," and the geometry of the shared directions snaps onto **uniform polytopes** (digons, triangles, tetrahedra, pentagons) — features arrange themselves at vertices of regular shapes so that pairwise interference is equalized. There is even a regime analogous to the fractional quantum Hall effect, where features collectively occupy fractional dimensions.

**Why it matters.** Superposition is the leading mechanistic explanation for why neurons in real LLMs are not interpretable on their own, and it motivates the entire **sparse autoencoder (SAE)** research program: if features live on near-orthogonal directions rather than coordinate axes, you must learn an overcomplete dictionary to recover them. It also hints at links to adversarial examples (small perturbations along interference directions) and to capacity laws (how much a model can learn per parameter).

**Key references.**
- Elhage, Hume, Olsson, Schiefer, Henighan, Kravec, Hatfield-Dodds, Lasenby, Drain, Chen, Grosse, McCandlish, Kaplan, Amodei, Wattenberg, Olah. "Toy Models of Superposition." Transformer Circuits Thread, 2022. https://transformer-circuits.pub/2022/toy_model/index.html / https://arxiv.org/abs/2209.10652
- Scherlis, Sachan et al., "Polysemanticity and Capacity in Neural Networks," 2022. https://arxiv.org/abs/2210.01892

**Open questions / controversies.**
- *Superposition ≠ polysemanticity.* A 2023 LessWrong/Alignment Forum analysis ("Superposition is not 'just' neuron polysemanticity") argues that polysemanticity can arise without superposition — e.g. from misaligned-but-orthogonal features, non-linear (softmax-mediated) encodings, or compositional binary codes. Treating the two as synonymous risks over-claiming what SAEs recover.
- *Does the toy story scale?* Whether the polytope geometry of toy ReLU autoencoders predicts feature geometry in production transformers is still being tested; recent work (e.g. Anthropic's Claude 3 Sonnet feature extraction, 2024) finds millions of monosemantic-looking features but does not directly verify the polytope picture.
- *Computation in superposition.* Vaintrob et al., "On the Complexity of Neural Computation in Superposition" (2024, https://arxiv.org/abs/2409.15318) ask whether networks can also *compute* — not just *store* — in superposition, and at what cost. This remains open.
