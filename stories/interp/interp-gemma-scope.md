---
id: interp-gemma-scope
cluster: interp
concept: Gemma Scope / Gemma Scope 2
status: done
sources:
  - https://arxiv.org/abs/2408.05147
  - https://deepmind.google/blog/gemma-scope-helping-the-safety-community-shed-light-on-the-inner-workings-of-language-models/
  - https://deepmind.google/blog/gemma-scope-2-helping-the-ai-safety-community-deepen-understanding-of-complex-language-model-behavior/
  - https://arxiv.org/html/2509.02565v2
generated_at: 2026-04-25
---

镇上有一座老钟楼,百年来无人能进。它整点鸣响,误差可达十几秒,却从不示人内里。市政厅雇过三任工程师:第一任只在塔基外测了风速,第二任拆下一颗螺丝便被告诫不可冒险,第三任画了张外观图就告老。钟还是钟,镇上没人知道它为什么慢。

新来的女孩名叫林知夏,带来一种奇怪的工具——薄如蝉翼的玻璃纸,贴上去可以把齿轮的某种"颤动"印下来,撕下来再读。她说颤动是连续的,纸却只能记下"跳起"的那一瞬:不到某个门槛,纸是空的;一旦越过,便清晰地落下一笔。她说这样最干净,因为齿轮真正"在工作"的瞬间寥寥无几,大部分时候只是惯性。

她不肯只贴一层。她要贴在每一个轴、每一个连杆、每一个隐蔽的销钉之间——上层、下层、夹层都不放过。同事劝她:挑三五处要害就够了。她摇头:"省下来的力气,会让后来的人继续猜测;猜测会让钟楼继续是个谜。我宁可一次贴够。"她请求市政厅借出钟楼大约一成五的电力,把每一秒的颤动都灌进底下的地窖。地窖很快堆满了二十来座小山似的胶卷。

贴完之后,她做了一件让镇议会皱眉的事:她把所有的玻璃纸——四百多张,每张上面有数万道独立的痕迹——影印若干份,连同读纸的方法、贴纸的位置、每张纸的误差度量,统统放在镇口的木箱里,任何人都可以来取。她不写论文,也不开课。她说:"我看不懂的颤动,镇外的钟匠也许看得懂;镇外的钟匠看不懂的,孩子也许看得懂。我若把这些纸锁进抽屉,等我退休,谜就跟我一起退休。"

几周后,镇上来了形形色色的人:一个学徒发现夹层里某一道颤动只在阴雨天出现,对应着钟楼受潮膨胀;一位退休教师注意到某根销钉的痕迹,每逢有人从塔下大喊就会激活,她由此推断出钟楼内嵌的"听觉"。还有人指出有几道痕迹其实是"以E开头但不是大象"这种古怪东西——是玻璃纸自身为了显得干净而硬挤出来的伪概念。林知夏把这条批评也贴进了木箱,标注为"已知问题"。

第二年,她回来了,带着新一批纸。这次她贴上了镇里另外几座更小、更新的钟楼,从掌心大的座钟一直到城门塔。她把变压器、跨层连杆、连接两个钟面之间的齿轮链也一并印下,并且用一种"俄罗斯套娃"式的方法,使粗的概念套着细的概念。木箱越堆越高,但每张纸依然敞开。她说:"我不是来解谜的。我只是把谜变成一千个可以分头解的谜。"

---

## Concept and field

**Gemma Scope** (Lieberum et al., 2024) and its successor **Gemma Scope 2** (DeepMind, 2025) are open releases of *sparse autoencoder* (SAE) suites trained on Google DeepMind's Gemma 2 and Gemma 3 model families. They sit in the **mechanistic interpretability** cluster, specifically in the line of work that decomposes a language model's residual-stream and MLP activations into a large dictionary of (hopefully) monosemantic latent features.

## Key mechanism

A sparse autoencoder learns an over-complete dictionary `W_dec ∈ R^(M × d)` (with M ≫ d) such that each activation vector `x` can be reconstructed as `x ≈ W_dec · f(x)` where the code `f(x)` is sparse — only a few latents fire on any given token. Gemma Scope's defining choices are:

1. **JumpReLU activation.** Instead of standard ReLU + L1 sparsity, Gemma Scope uses JumpReLU SAEs (Rajamanoharan et al., 2024): an activation is set to zero unless its pre-activation crosses a learned threshold θ, at which point it "jumps" to its full pre-activation value. This decouples *whether* a feature fires from *how strongly* it fires, reducing the shrinkage bias of L1.
2. **Everywhere, all at once.** Gemma Scope trains SAEs at every layer and every sub-layer (residual stream, attention output, MLP output) of Gemma 2 2B and 9B, plus selected layers of 27B — over 400 SAEs and ~30M total latents, consuming ~15% of the compute used to pretrain Gemma 2 9B and ~20 PiB of cached activations.
3. **Open release.** Weights, evaluation metrics, and tutorials are published on Hugging Face so external researchers can do circuit analysis, feature steering, and safety probing without re-training the infrastructure.

**Gemma Scope 2** (Dec 2025) extends this to the Gemma 3 family (270M → 27B), adds *transcoders*, *skip-transcoders*, *cross-layer transcoders* for multi-step circuit tracing, and uses **Matryoshka training** so a single SAE contains nested dictionaries of varying granularity. It also includes SAEs trained on chat-tuned variants to study refusal and jailbreak mechanisms.

## Why it matters

Before Gemma Scope, every interpretability lab had to train its own SAEs — a prohibitive cost that fragmented the field. By eating that cost once and releasing the artifacts, DeepMind turned SAE research from "infrastructure project" into "downstream science": probing chain-of-thought, hallucination, and jailbreak circuits became tractable for academics and independent researchers. It is the closest thing the interpretability community has to ImageNet.

## Open questions and controversies

- **Reconstruction fidelity is still poor.** Splicing SAE-reconstructed activations back into the model degrades downstream performance by 10–40%, leaving open whether the "features" we read off are faithful to what the model actually computes.
- **Feature absorption / splitting.** Chanin et al. (2024) and follow-ups show SAEs can manufacture pathological latents (e.g. "starts with E but isn't 'elephant'") to maximize the sparsity objective, casting doubt on monosemanticity claims.
- **Feature manifolds.** Recent work (Mendel et al., 2025, *Understanding sparse autoencoder scaling in the presence of feature manifolds*) argues that many "features" are points sampled from continuous manifolds, and that scaling dictionary size simply shatters those manifolds further rather than resolving them.

## References

- Lieberum, T., Rajamanoharan, S., Conmy, A., Smith, L., Sonnerat, N., Varma, V., Kramar, J., Shah, R., Dragan, A., Nanda, N. (2024). *Gemma Scope: Open Sparse Autoencoders Everywhere All At Once on Gemma 2*. arXiv:2408.05147. https://arxiv.org/abs/2408.05147
- Google DeepMind (2024). *Gemma Scope: helping the safety community shed light on the inner workings of language models*. https://deepmind.google/blog/gemma-scope-helping-the-safety-community-shed-light-on-the-inner-workings-of-language-models/
- Google DeepMind (2025). *Gemma Scope 2: Helping the AI Safety Community Deepen Understanding of Complex Language Model Behavior*. https://deepmind.google/blog/gemma-scope-2-helping-the-ai-safety-community-deepen-understanding-of-complex-language-model-behavior/
- *Understanding sparse autoencoder scaling in the presence of feature manifolds* (2025). arXiv:2509.02565. https://arxiv.org/html/2509.02565v2
