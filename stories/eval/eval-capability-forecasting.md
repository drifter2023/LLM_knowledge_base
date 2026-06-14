---
id: eval-capability-forecasting
cluster: eval
concept: Capability Forecasting
status: done
sources:
  - https://arxiv.org/abs/2502.15850
  - https://arxiv.org/html/2405.10938v3
  - https://epoch.ai/blog/how-predictable-is-language-model-benchmark-performance
  - https://arxiv.org/abs/2206.07682
generated_at: 2026-04-25
---

老周在景德镇守了三十年的窑口。每一窑要烧三天三夜,松柴的克数、窑膛的温度、坯胎的厚薄,他都记在一本油渍斑斑的小册子里。

他最骄傲的本事,是开窑之前能告诉你,这一窑里那只最大的梅瓶,釉色会落在哪一档。徒弟们觉得这是玄学,他却说不是。

"你看这五十窑,"他翻开册子,"小器最容易出彩,中器次之,大器最难。可大器一旦出彩,就是惊世的物件。"他在纸上画了一条曲线,小器的良品率早早爬到八成就趴下了,中器一路缓升,大器在前四十窑几乎全是废品,到了第四十二窑,忽然跳出一只完美的青花。

"很多人看到第四十二窑那一跳,就说窑神显灵了。我不这么看。"老周指着小器的曲线,"小器在第十窑就告诉我,这批柴火的含水率比往年低半成;中器在第二十五窑告诉我,窑膛北侧的火路比南侧顺三分。等大器轮到它显形的时候,该有的征兆早都齐了——只是它的尺度大,要等积够了热,釉才肯流。"

那年开春,镇上一位富商找上门,说要烧一对前所未有的大缸,高过一人,问老周敢不敢接。老周没立刻答。

他先烧了一批等比缩小的样品,从拳头大的小罐开始,一路放大到半人高的中罐,一共七档尺寸。每一档都烧三窑,把良品率、釉面厚度、开片密度都记下来。回到桌前,他在册子上重新画曲线——七个点,几乎落在一条平滑的弧线上。他用尺子把弧线往右延伸,延伸到那对大缸的尺度,读出一个数字:六成出一只完整的,两只都成的概率不到四成。

他把这个数字告诉富商。富商皱眉:"老师傅,你还没烧,怎么就知道?"

老周说:"我烧过七个尺寸的小弟弟了。它们每一个,都在替那对大缸说话。"

富商不信邪,坚持要烧。老周收了订金,按曲线预报的损耗,多备了三对坯胎。开窑那日,第一对大缸果然只成了一只,第二对成了一只半。富商目瞪口呆,问他这门手艺叫什么。

老周合上册子,只说了一句:"我没看见过明天的窑,可我看过今天的七只小罐。它们排成一行的时候,明天就在那条线的尽头等着我。"

---

## Capability Forecasting

**Field.** Evaluation and safety science for large language models (cluster: `eval`). Capability forecasting is the methodology of predicting how a *next-generation* model — one that has not yet been trained, or has been trained but not yet evaluated on a target benchmark — will perform, using only data from smaller, cheaper, or earlier models.

**Why it matters.** Frontier training runs cost tens of millions of dollars and carry non-trivial safety stakes (cyber-offense, autonomous agency, bio-uplift). Decision-makers — lab leadership, evaluators, regulators — need to know the expected capability *before* the run lands, not after. Capability forecasting is the discipline that turns "we'll see when GPT-N ships" into a quantitative bet with calibrated error bars.

**Key mechanisms.**

1. **Compute-to-loss-to-task pipeline.** Classical scaling laws (Kaplan 2020; Hoffmann/Chinchilla 2022) map FLOPs to pre-training loss. A second stage maps loss to downstream benchmark accuracy. Owen / Epoch AI (2024) showed that aggregate benchmark scores are predictable with ~6 percentage-point MAE across an order of magnitude of compute, while individual tasks remain noisy.
2. **Observational scaling laws** (Ruan, Maddison, Hashimoto, 2024). Rather than train a new model family, fit scaling behavior to ~100 *existing* public models. PCA over their benchmark scores extracts a low-dimensional "capability space"; principal components correlate log-linearly with compute within a family, letting you extrapolate even emergent-looking abilities and agentic tasks (e.g., predicting GPT-4 from weaker models).
3. **Two-step agent forecasting** (Pimpale, Højmark, Scheurer, Hobbhahn, 2025). For agentic benchmarks like SWE-Bench Verified, predicting `release date → Elo → benchmark` outperforms direct one-step regressions. Six forecasting methods are compared; intermediate-metric methods win.
4. **Slice-and-sandwich / difficulty stratification.** Group benchmark items by difficulty so the smooth sigmoidal layer underneath an apparently "emergent" jump becomes visible — recovering predictability from what looked like a phase transition.

**Open questions / controversies.**

- *Are emergent abilities real or a metric artifact?* Wei et al. (2022) argued emergence is genuine and unpredictable; Schaeffer et al. (2023, "Are Emergent Abilities a Mirage?") argued sharp jumps are largely an artifact of nonlinear / discontinuous metrics, and that under continuous metrics scaling is smooth. Capability forecasting sits squarely on Schaeffer's side of the debate.
- *Out-of-distribution capabilities.* Forecasts assume the next model is qualitatively the same beast, only larger / better-trained. Architectural shifts (mixture-of-experts, long-horizon RL, tool use) can violate the extrapolation.
- *Safety-critical tails.* A 6-point MAE on aggregate accuracy is acceptable for product planning but inadequate for predicting rare catastrophic capabilities, where the question is "does the model ever succeed?" not "what is its mean score?"

**Key references.**

- Ruan, Maddison, Hashimoto. *Observational Scaling Laws and the Predictability of Language Model Performance.* 2024. https://arxiv.org/abs/2405.10938
- Pimpale, Højmark, Scheurer, Hobbhahn. *Forecasting Frontier Language Model Agent Capabilities.* 2025. https://arxiv.org/abs/2502.15850
- Owen. *How Predictable Is Language Model Benchmark Performance?* Epoch AI, 2024. https://epoch.ai/blog/how-predictable-is-language-model-benchmark-performance
- Wei et al. *Emergent Abilities of Large Language Models.* 2022. https://arxiv.org/abs/2206.07682
