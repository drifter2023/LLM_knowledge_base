---
id: scaling-loss-landscape
cluster: scaling
concept: Loss Landscape & Mode Connectivity
status: done
sources:
  - https://arxiv.org/abs/1802.10026
  - https://direct.mit.edu/neco/article/9/1/1/6027/Flat-Minima
  - https://arxiv.org/pdf/1703.04933
  - https://arxiv.org/abs/1912.05671
  - https://personalrobotics.cs.washington.edu/publications/ainsworth2023gitrebasin.pdf
generated_at: 2026-04-25
---

雾灵山测绘局派出两支队伍,分别从东坡和西坡上山,各自寻找传说中"水最静、风最缓"的隐谷。两队互不通信,只带着同一份模糊的旧图与同一架气压计。三个月后,东队在一处山坳停下,他们说:这里风是零,水是平的。西队在另一片背风林里也停下,声称:此处亦是。

测绘局的年轻档案员沈识予听罢,把两份坐标摊在桌上,愣了一愣——两点相距足有四十里,中间横着一道她记忆中的赤裸石脊。按旧图所示,从东坳往西林走,必须翻过那道脊,中途风声大作,气压剧烈起伏,绝无可能是连贯的"静地"。

老局长却笑:"你只看了直线。山不是按直线长的。"

他派沈识予亲自带人去走一趟。她不走直线,而是顺着山势,沿一条略向南弯的旧采药小径绕行。出乎意料,整条小径上,气压计的指针几乎没有动,溪水都是缓的,松针落地无声。她甚至在弯道中间扎了营,夜里听不见一丝风。她回去复命:"两个隐谷之间有一条看不见的廊道,只是不在直线上,得拐一下。"

老局长点头:"再派人,从更远的北坡找一个新的'静地',再把它和这两个连起来看看。"

果然,北坡那一处也能用一条带弯的小径,与东坳、西林两两相连,沿途风压都不变。三处看似孤立的隐谷,其实属于同一片悄然蔓延的低地——只是肉眼从山顶望去,被中间的石脊和林冠遮断,误以为是三个孤岛。

沈识予在档案里写下一段话:"我们一直以为山中有许多互不相通的静地,各自为政;其实它们多半被一条条弯曲的廊道串成一片。所谓'孤岛',只是直线视角下的错觉。"

她又附了一条按语,语气更轻:"但廊道之'静'是否真的预示着这一带土地肥沃、来年宜耕,我尚不敢断言。先师有言,土地的好坏与谷地的宽窄相关——越宽的谷地,容得下越多的偏差,种子落得歪一点也无妨,故而稳。然而本朝有人指出,只要换一种丈量单位,'宽'与'窄'便会互换;甲尺下宽阔的谷,乙尺下竟成尖锐的裂缝。所以,'宽即吉'之说,尚需更稳的丈尺去验。"

她搁下笔,望向窗外群山。她忽然意识到:东队和西队若把各自队员重新编号、换一种顺序登记,两份坐标就会在直线上对齐——那道横亘的石脊,根本是记账方式造成的幻影。山没有变,只是人换了一种数它的方式。

---

## Concept and Field

**Loss Landscape & Mode Connectivity** sits at the intersection of optimization theory and the empirical science of deep learning, within this knowledge base's *scaling / optimization* cluster. It asks: what is the geometric shape of the function $L(\theta)$ that training minimizes, and how does that shape relate to generalization?

## Key Mechanism

Two distinct findings, often conflated, anchor the topic:

1. **Flat vs. sharp minima.** Hochreiter & Schmidhuber (1997) defined a *flat minimum* as a large connected region in weight space over which the loss stays nearly constant, and gave an MDL/Bayesian argument that such minima encode "simpler" models and should generalize better. Keskar et al. (2017) revived the idea empirically, showing that large-batch SGD finds sharper minima with worse test accuracy than small-batch SGD.

2. **Mode connectivity.** Garipov et al. (2018) discovered that two independently trained SGD solutions $\theta_A, \theta_B$ — apparently isolated minima — can be connected by a smooth curve $\phi_\eta(t)$, $t \in [0,1]$, parameterized by $\eta$ (e.g. a Bezier curve or a polygonal chain with one bend), along which the loss remains essentially equal to the loss at the endpoints. The curve is found by minimizing $\mathbb{E}_{t \sim U[0,1]}\,[L(\phi_\eta(t))]$ over $\eta$. So what looks like a rugged landscape with isolated valleys is, on the loss surface that matters, a **single connected low-loss manifold**.

   Frankle et al. (2020) sharpened this with **linear mode connectivity**: after a short "stability" phase of training, two SGD runs branching from the same checkpoint converge to solutions connected by a *straight line* of constant loss — a fact tightly linked to the lottery ticket hypothesis. Ainsworth et al.'s **Git Re-Basin** (2023) went further: when you account for the permutation symmetries of hidden units, even fully independent training runs appear to land in (approximately) a *single* basin, with zero-barrier linear interpolation possible after re-aligning neurons.

## Why It Matters

- It overturned the folk picture of deep nets as exponentially many isolated local minima.
- It enables **Fast Geometric Ensembling** and **Stochastic Weight Averaging**: cheap ensembles or single-point estimators that exploit the low-loss curve.
- It explains why model **soups** and **weight merging** work, and underlies the practice of averaging fine-tunes.
- It frames generalization geometrically — a rare bridge between optimization and statistical learning theory.

## Open Questions and Controversies

- **Dinh et al. (2017), "Sharp Minima Can Generalize for Deep Nets"** showed that sharpness is not reparameterization-invariant: by rescaling weights one can make any minimum arbitrarily sharp without changing the function it computes. This undercuts naïve "flat = generalizes" claims and motivates ongoing work on parameterization-invariant flatness measures (e.g. PAC-Bayes flatness, information-geometric notions).
- Whether mode connectivity is *mechanistic* (functionally equivalent solutions) or merely loss-level (different computations achieving the same loss) is an active question (Lubana et al., 2023, "Mechanistic Mode Connectivity").
- Linear mode connectivity at scale (LLM-sized models, across pre-training seeds) remains only partially verified.

## References

- Hochreiter, S. & Schmidhuber, J. (1997). *Flat Minima.* Neural Computation. <https://direct.mit.edu/neco/article/9/1/1/6027/Flat-Minima>
- Keskar, N. et al. (2017). *On Large-Batch Training for Deep Learning: Generalization Gap and Sharp Minima.* ICLR.
- Garipov, T., Izmailov, P., Podoprikhin, D., Vetrov, D. & Wilson, A. G. (2018). *Loss Surfaces, Mode Connectivity, and Fast Ensembling of DNNs.* NeurIPS. <https://arxiv.org/abs/1802.10026>
- Dinh, L., Pascanu, R., Bengio, S. & Bengio, Y. (2017). *Sharp Minima Can Generalize For Deep Nets.* ICML. <https://arxiv.org/pdf/1703.04933>
- Frankle, J., Dziugaite, G. K., Roy, D. & Carbin, M. (2020). *Linear Mode Connectivity and the Lottery Ticket Hypothesis.* ICML. <https://arxiv.org/abs/1912.05671>
- Ainsworth, S., Hayase, J. & Srinivasa, S. (2023). *Git Re-Basin: Merging Models Modulo Permutation Symmetries.* ICLR. <https://personalrobotics.cs.washington.edu/publications/ainsworth2023gitrebasin.pdf>
