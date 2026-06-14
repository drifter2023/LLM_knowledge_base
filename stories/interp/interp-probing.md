---
id: interp-probing
cluster: interp
concept: Probing & Diagnostic Classifiers
status: done
sources:
  - https://arxiv.org/abs/2102.12452
  - https://aclanthology.org/2022.cl-1.7.pdf
  - https://aclanthology.org/D19-1275.pdf
  - https://www.cs.columbia.edu/~johnhew/interpreting-probes.html
generated_at: 2026-04-25
---

林老师在山脚下办了一所很小的钢琴学校,学生不到二十人。她从不公开课堂,却放出一句怪话:**"我能从一个人手指落键的方式,听出他童年是不是说方言长大的。"**

县城的记者半信半疑,带着一位语言学教授王砚去探访。

林老师把他们带进琴房,叫来一个十二岁的男孩弹了一段练习曲。她侧耳听完,说:"吴语,太湖片。"男孩点头。又叫来一个女孩,弹同样的曲子,她说:"北方官话,带一点晋南的入声残留。"女孩也点头。

王砚皱眉。他从随身的本子里挑了三十段录音——都是这所学校学生在不同日子弹的练习曲——放给林老师听,只听音,不见人。林老师一一报出方言归属,准确率高得惊人。

记者激动地写稿。王砚却拦住他:"先别发。我怀疑她不是在听琴,而是在认人。"

第二天,王砚做了一件让林老师不悦的事。他从录音里随机挑了二十段,**重新给每段贴上完全随机的方言标签**——把吴语的录音说成是闽南话,把北方话的说成是粤语——然后告诉林老师,这是另一批新学生,请她重听一遍,记住每段对应哪种"方言"。

三天后,王砚回来抽考。林老师居然也能把这套**乱配的标签**七七八八地背回来。

王砚转向记者:"你看。她记忆力极强,听一遍就能把'这段录音'和'某个标签'绑在一起,无论那个标签是真是假。所以她在真实测试里报得准,**未必**是因为指法里真的藏着方言的痕迹——也可能只是她把每个学生的指法当成指纹,死死记下了。"

记者愣住:"那怎么才能分辨?"

王砚说:"看差距。我们要比较两个数字:她在**真任务**上的准确率,和她在**乱配任务**上的准确率。如果两者都高,说明她靠的是记性,不是听力;如果真任务远高于乱配任务,那中间的那一截差距,才是指法里**真正**编码了方言信息的证据。"

他们重新做了实验。林老师在真任务上准确率九成,在乱配任务上准确率也有七成。差距只有两成。

"两成,"王砚轻声说,"是她真正'听'出来的部分。其余七成,是她作为一个聪明人,自己学会的。"

可故事没完。半年后,另一位研究者来访,提了一个更刁钻的问题:"就算那两成差距是真的,你怎么知道孩子们**弹琴时**真的用到了方言的肌肉记忆?也许方言信息只是**附带**留在指法里,像衣服上沾的灰,而真正驱动他们演奏的,是别的东西。要证明方言**被使用了**,你得想办法把方言信息从他们手上**抹掉**,再看演奏会不会变。"

林老师听完,长久没说话。她终于明白:**听得见**一件事,和那件事**真的在起作用**,从来不是同一回事。

---

## Concept and field

**Probing & Diagnostic Classifiers** belong to the **interpretability** cluster of LLM research. A probe is a small auxiliary classifier (often linear or shallow MLP) trained on the frozen internal representations of a pretrained model to predict some property of interest — part-of-speech, syntactic dependency depth, sentiment, factual attributes, even truthfulness. If the probe succeeds, the representation is said to "encode" that property.

## Key mechanism

Given a model `f` and an input `x`, take an intermediate hidden state `h = f_l(x)` from layer `l`. Train a probe `g_θ` on labeled pairs `(h, y)` where `y` is the target property, holding `f` frozen. Test-set accuracy of `g_θ` is reported as evidence that layer `l` represents `y`.

Three known failure modes and their fixes:

1. **The probe memorizes rather than reads.** Hewitt & Liang (2019) introduced **control tasks**: re-label the same inputs with a random but consistent target (e.g., assign each word type a random POS tag). A high-capacity probe can fit the random labels too. Define **selectivity = accuracy(real task) − accuracy(control task)**. Only selective probes warrant interpretive claims; linear probes turn out far more selective than MLPs.
2. **Information ≠ usage.** The probe shows the property is *decodable*, not that the model *uses* it downstream. **Amnesic probing** (Elazar et al. 2021) and causal interventions remove the property from `h` (e.g., via iterative nullspace projection) and check whether the model's behavior degrades; only then is the property causally implicated.
3. **Probe-complexity confound.** Pimentel et al. and Voita & Titov reframed probing in **information-theoretic** terms: report the **minimum description length (MDL)** of the labels given the representation, which jointly penalizes accuracy and probe complexity, removing the arbitrary choice of probe family.

## Why it matters

Probes are the cheapest, most ubiquitous interpretability tool — every claim of the form "BERT layer 8 encodes syntax" or "the model represents truthfulness in a linear direction" descends from probing. The methodological critiques above are the reason modern interpretability has shifted toward **causal** methods (activation patching, SAEs, circuits): probing tells you what is *legible* in a representation, not what is *load-bearing*.

## Open questions and controversies

- The Hewitt & Liang selectivity critique remains unresolved in practice: many published probing results never report a control task.
- Whether linear probes are the "right" probe class is contested — Pimentel et al. (2020) argue that under the information-theoretic view, more powerful probes are not inherently worse.
- The gap between "encoded" and "used" continues to motivate the migration from probing toward causal interpretability (patching, ablation, dictionary learning).

## References

- Belinkov, Y. (2022). *Probing Classifiers: Promises, Shortcomings, and Advances.* Computational Linguistics 48(1). https://aclanthology.org/2022.cl-1.7.pdf
- Belinkov, Y. (2021). arXiv preprint of the same squib. https://arxiv.org/abs/2102.12452
- Hewitt, J., & Liang, P. (2019). *Designing and Interpreting Probes with Control Tasks.* EMNLP. https://aclanthology.org/D19-1275.pdf
- Hewitt, J. Companion blog post on probe design. https://www.cs.columbia.edu/~johnhew/interpreting-probes.html
