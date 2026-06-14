---
id: interp-activation-patching
cluster: interp
concept: Activation Patching / Causal Mediation
status: done
sources:
  - https://arxiv.org/abs/2202.05262
  - https://arxiv.org/html/2404.15255v1
  - https://rome.baulab.info/
generated_at: 2026-04-25
---

老周在县刑警队干了三十年,临退休那年,接了一桩盗窃古钱币的案子。

案情简单得离奇:藏家陈伯把一枚战国刀币锁在书房保险柜里,周二晚上失窃,周三早上发现。那天屋里只有六个人——管家、厨师、园丁、司机、远房侄子、还有一个上门掌眼的老相识。六个人都说自己什么也没看见。

按规矩,老周本该一个一个审。但他没有。

他把六个人请回陈伯家,让他们按周二晚上的位置,各回各的房间,各做各的事。管家擦灯,厨师收碗,园丁锁后门,司机擦车,侄子在客厅看电视,老相识在书房陪陈伯品茶。然后让他们把整晚的动作再走一遍——从七点到十一点,分秒不差。

走完一遍,刀币还在保险柜里(他事先放了一枚仿品)。一切如常。这是"干净的那一晚"。

第二天,他把六个人又请来,这次他在每个人的口袋里塞了一张小纸条,上面写着一个时间和一个动作——"八点十七分,假装系鞋带停三秒"、"九点零四分,把茶杯换到左手"。六个人照办。整晚下来,仿品不见了。这是"被搅乱的那一晚"——他不知道是谁拿的,但他知道,这一晚的某个环节里,藏着真正那一晚发生的事。

接下来的六个晚上,老周做了一件让所有人都觉得他疯了的事。

每一晚,他只让**一个人**按"干净那一晚"的方式行动,其余五个人继续按"搅乱那一晚"的小纸条走。第一晚,只有管家恢复正常,其他人照旧搅乱——刀币丢了。第二晚,只有厨师恢复正常——刀币还是丢了。第三晚轮到园丁——丢了。第四晚司机——丢了。第五晚侄子——丢了。

第六晚,只有那位上门掌眼的老相识恢复成"干净那一晚"的状态:七点四十分进书房,八点二十分起身去洗手间,八点二十三分回来,九点整告辞。其余五人继续按搅乱的剧本走。

那一晚,刀币安然无恙。

老周抓的不是"动机最强的人",也不是"最后一个离开的人"。他抓的是这样一个人:**只要把他那一晚的行动恢复原样,整个屋子的结局就会从"丢"翻转回"不丢"**。其他五个人各自的纸条无论怎么写、怎么搅,都改不了大局。也就是说,在那个屋子的因果网络里,真正承载着"刀币去向"这条信息的节点,是他,而且只是他在八点二十分到八点二十三分之间的那三分钟。

退休那天,小徒弟问他:"师父,您怎么不一个个审,非要把六个晚上都重演一遍?"

老周笑笑:"问话能问出谁会撒谎,问不出信息从哪儿流过去。一个屋子里六张嘴,六颗心,你想知道哪一颗心是中间那一环,就得让其他五颗心同时坏掉,再单独把那一颗修好,看看屋子还转不转得动。"

他顿了顿,又说:"模型里的神经元,跟这屋里的人,是一个道理。"

---

## Concept and field

**Activation Patching**, also known as **Causal Tracing**, **Interchange Intervention**, or **Causal Mediation Analysis**, is a core technique in the **mechanistic interpretability** cluster of LLM research. Rather than asking "what does this neuron correlate with?", activation patching asks the strictly causal question: *which internal components, if surgically restored, are sufficient to flip the model's output from wrong to right?*

## Key mechanism

The procedure requires three forward passes over a carefully matched counterfactual pair:

1. **Clean run.** Run the model on a clean prompt (e.g. "The Space Needle is in the city of") and cache every internal activation — residual stream states, MLP outputs, attention head outputs — at every layer and token position.
2. **Corrupted run.** Run the model on a perturbed version of the prompt (e.g. with the subject tokens replaced by Gaussian noise, or swapped to a different entity). The model now produces the wrong answer.
3. **Patched run.** Re-run the corrupted prompt, but at one chosen `(component, layer, token)` site, *overwrite* the corrupted activation with the cached clean activation. Measure how much the correct-answer probability is restored. This restoration is the **indirect effect** of that site.

Sweeping the patch site across all layers and token positions yields a heatmap of causal importance. In Meng et al.'s ROME work on GPT, this heatmap revealed two crisp peaks: an **early site** in mid-layer MLPs at the *last subject token* (where factual recall happens) and a **late site** in upper-layer attention at the *final token* (where the recalled fact is routed to the output).

The technique is asymmetric. **Denoising** (clean → corrupted) tests whether a component is *sufficient* to recover behavior. **Noising** (corrupted → clean) tests whether it is *necessary*. AND-gate circuits are revealed only by noising; OR-gate circuits only by denoising. This asymmetry is one of the most-misunderstood points in the literature.

## Why it matters

Activation patching turned interpretability from a correlational science (probes, neuron visualization) into a causal one. It is the experimental backbone of nearly every modern circuit discovery — IOI, induction heads, factual recall, refusal directions — and the empirical foundation that justifies model editing methods like ROME and MEMIT. Attribution patching (Nanda) later approximated the procedure with gradients to scale it to thousands of sites at once.

## Key references

- Meng, Bau, Andonian, Belinkov (2022). *Locating and Editing Factual Associations in GPT.* NeurIPS 2022. https://arxiv.org/abs/2202.05262
- Heimersheim & Nanda (2024). *How to use and interpret activation patching.* https://arxiv.org/html/2404.15255v1
- Project page with interactive causal traces: https://rome.baulab.info/

## Open questions / controversies

- **Sufficient ≠ minimal.** Patching finds *a* set of components that restores behavior, never the smallest one. Reported "circuits" are often over-broad.
- **Backup behavior and self-repair.** When a head is ablated, downstream heads sometimes compensate, masking the original component's true role and producing misleadingly small effects.
- **Negative components.** Some heads consistently hurt performance; their presence in patched circuits creates ambiguity about what "restoration" means.
- **Distributional scope.** Conclusions hold only for the specific counterfactual pair distribution tested — generalization to broader behavior is an empirical, not logical, claim.
- **Denoise/noise confusion.** Heimersheim & Nanda (2024) emphasize that papers routinely conflate the two and report sufficiency claims as if they were necessity claims.

## References

- [Locating and Editing Factual Associations in GPT (Meng et al., 2022)](https://arxiv.org/abs/2202.05262)
- [How to use and interpret activation patching (Heimersheim & Nanda, 2024)](https://arxiv.org/html/2404.15255v1)
- [ROME project page — causal tracing visualizations (Bau Lab)](https://rome.baulab.info/)
