---
id: icl-as-gradient-descent
cluster: icl
concept: ICL as Gradient Descent
status: done
sources:
  - https://arxiv.org/abs/2212.07677
  - https://proceedings.mlr.press/v202/von-oswald23a/von-oswald23a.pdf
  - https://arxiv.org/html/2310.08540v5
  - https://iclr-blogposts.github.io/2024/blog/understanding-icl/
  - https://aclanthology.org/2024.naacl-long.58.pdf
generated_at: 2026-04-25
---

老周在城南开了一家小裁缝铺,招牌写着"看一眼就会做"。客人不用报尺寸,只要把自己几件旧衣服平摊在长案上,老周扫一眼,半小时后就能照样剪出一件合身的新褂子。同行都说他天生神眼,他自己却笑笑不接话。

学徒小林跟了他三年,始终参不透师父这一眼里的门道。他偷偷量过那些旧衣的领围、肩宽、袖长,记了满满一本,可数字怎么凑都凑不出师父出手时的那条曲线。直到那年腊月,老周病倒,临终前把小林叫到床前,从枕头下摸出一块青布,布上密密麻麻缝着许多小铅块。

"你以为我看的是衣服,"老周喘着气说,"我看的是衣服和我心里那件'标准坯子'的差。"

他让小林把青布铺在案上,把客人旧衣一件件叠上去。每叠一件,布就因为铅块的分布往某个方向微微塌陷一点。三件叠完,青布已经变成了一个浅浅的、贴合客人体型的模子。老周说:"我不是记尺寸,我是让每一件旧衣都'推'我那块坯子一下,推的方向是它和坯子不一样的地方,推的力气是它有多不一样。三件推完,坯子就已经是新衣的样子了——我只不过照着剪。"

小林呆住。他想起自己这三年记下的那本数字,那些数字是死的,而师父的青布是活的:它不存任何一件旧衣,它只存"被推过之后的形状"。每来一位新客人,师父其实都在心里重新铺一次青布,让眼前的几件旧衣依次推它,直到坯子收敛成那个人。

后来小林接了铺子,他在案子底下钉了一块真正的铅布,逢人问起就说是镇案用的。只有他自己知道,每当客人摊开旧衣,他闭上眼,那块布就在脑子里轻轻起伏——一件衣服来,塌一下;再一件,再塌一下。等他睁开眼,剪刀已经知道该往哪里走。

他也终于明白师父那句"看一眼就会做"的真意:那一眼里,藏着一连串极快的、谁也看不见的"塌陷"。看的人以为是顿悟,其实是几步小小的、踩在差值上的下坡。

---

## ICL as Gradient Descent

**Field.** Mechanistic theory of in-context learning (ICL) — cluster *icl* in this knowledge base. The question: when a Transformer is shown a few (x, y) demonstrations in its prompt and then produces y for a new x, what algorithm is the forward pass actually running?

**The mechanism (von Oswald et al., 2023).** Consider a single layer of *linear* self-attention reading a prompt of regression demonstrations (x_i, y_i) followed by a query x_q. Von Oswald et al. give an explicit weight construction for the Q, K, V, and projection matrices such that the layer's update to the query token is *exactly* the update one step of gradient descent on the squared-error loss

L(W) = Σ_i ‖ W x_i − y_i ‖²

would apply to an internal linear model W, starting from W=0, with learning rate η encoded in the projection matrix as P = (η/N)·I. Stacking K linear-attention layers therefore implements K steps of GD on the in-context data — the "mesa-optimizer." When they actually train such a Transformer end-to-end on random regression tasks, the learned weights converge to (a transform-equivalent of) this hand-built construction. They further show trained models can outperform vanilla GD by learning a *preconditioned* GD they call GD++, effectively performing iterative curvature correction. Ahn et al. (2023) and Mahankali et al. (2024) sharpen this: the global minimum of the pretraining objective for linear attention is a single step of preconditioned GD, with the preconditioner determined by the task-prior covariance.

**Why it matters.** ICL was, before this, a black box: a model with frozen weights apparently "learns" from prompts. The GD-equivalence reframes the prompt as a *training set the model trains on inside its forward pass*, and reframes attention layers as *optimizer steps*. This unifies meta-learning, fast-weights, and induction heads under one optimization-theoretic lens, and gives a constructive answer to "what does a context window compute?"

**Open questions and the live controversy.** The equivalence is proved for **linear** self-attention on synthetic regression with zero-mean Gaussian priors and W₀ = 0. Whether real, softmax-attention, language-pretrained LLMs perform anything like GD is contested.

- Deutch et al. (2024, NAACL, *In-context Learning and Gradient Descent Revisited*) and Shen et al. (2023, *Do pretrained Transformers Learn In-Context by Gradient Descent?*, arXiv:2310.08540) show that for LLaMA-class models, ICL and explicit fine-tuning by GD diverge on accuracy, output distribution, and especially **order-sensitivity**: GD averages over demonstrations and is permutation-invariant, while ICL is famously order-sensitive. The required weight sparsity in von Oswald's construction (>99.99%) is also absent in real pretrained checkpoints.
- The current consensus is therefore narrower than the headline: linear attention trained on an ICL objective provably implements (preconditioned) GD; pretrained LLMs doing softmax ICL on natural text are *gradient-descent-like in spirit* but not literally executing the von Oswald construction.

## References

- von Oswald, J., Niklasson, E., Randazzo, E., Sacramento, J., Mordvintsev, A., Zhmoginov, A., & Vladymyrov, M. (2023). *Transformers Learn In-Context by Gradient Descent.* ICML 2023. https://arxiv.org/abs/2212.07677
- Ahn, K., Cheng, X., Daneshmand, H., & Sra, S. (2023). *Transformers learn to implement preconditioned gradient descent for in-context learning.* NeurIPS 2023.
- Shen, L., Mishra, A., et al. (2023). *Do pretrained Transformers Learn In-Context by Gradient Descent?* arXiv:2310.08540. https://arxiv.org/html/2310.08540v5
- Deutch, G., Magar, N., Natan, T., & Dar, G. (2024). *In-context Learning and Gradient Descent Revisited.* NAACL 2024. https://aclanthology.org/2024.naacl-long.58.pdf
- ICLR 2024 Blogposts. *Understanding in-context learning in transformers.* https://iclr-blogposts.github.io/2024/blog/understanding-icl/
