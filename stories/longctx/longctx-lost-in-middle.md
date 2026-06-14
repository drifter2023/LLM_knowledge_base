---
id: longctx-lost-in-middle
cluster: longctx
concept: Lost in the Middle
status: done
sources:
  - https://arxiv.org/abs/2307.03172
  - https://aclanthology.org/2024.tacl-1.9/
  - https://github.com/nelson-liu/lost-in-the-middle
  - https://techxplore.com/news/2025-06-lost-middle-llm-architecture-ai.html
generated_at: 2026-04-25
---

县衙的老书吏姓吴,人称吴目。他在卷宗房里坐了三十年,练就一项本事:案子递上来,堆得再高,他也能只凭一眼判出哪份要紧、哪份可弃。

新任的县令是个谨慎人,不放心,要他每案都把所有相关供词通读一遍再下判。于是吴目每日清晨,便面对一摞摞按时序码好的供词卷:头一份是首告之言,末一份是最后到衙的证词,中间则夹着邻里、亲属、过路人的零散口供,有时多达二十份。

县令本以为这样最稳妥。三个月后,他翻看卷宗,却发现吴目下的判,竟比从前更偏。

偏在哪里呢?县令把每案的供词重新排过,亲自比对。他发现一个怪事:若那份真正点明案情的关键证词,被排在第一份或最末一份,吴目几乎从不漏看;可一旦那张纸夹在第七、第八、第十的位置,吴目就像没读到似的,判语里只字不提。

县令起初疑心吴目偷懒。便取一桩盗窃案做试:同样的二十份供词,只调换关键那张纸的位置,让吴目重判十遍。结果摆出来,像一只浅浅的碗——首尾位置,他判得清清楚楚;越往中间,越糊涂;到第十、十一份,几乎全凭瞎猜。

县令把吴目唤来问。老书吏惭愧地说:"大人容禀。小人读卷宗,头一份总是端坐着读,字字咬清,因为不知后头有什么,得先立个底子。读到末一份,知道要落判了,精神又提起来,生怕错过结尾的转折。可中间那些……大人,小人不是没读,是读过了,像水从掌心漏过去,留不下痕。"

县令默然。他又问别的老吏,问年轻的书办,甚至问自己——退堂之后,他翻看一日读过的奏本,能复述的,也无非是开篇与结尾。中段那些字,明明眼睛扫过,却仿佛从未进过心里。

他想起师爷讲过的旧话:衙门里办事,凡是要紧的话,要么开宗明义先讲,要么留到末了再说。夹在中间的,纵是金玉之言,也容易被当作衬纸。原以为这是讲话的礼数,如今看来,竟是听话的人天生如此——人脑子里有一只浅浅的碗,边沿高,中间塌,水倒进去,中间总是先空。

县令于是改了规矩:凡呈上的卷宗,关键证词必须摘出,或置于卷首,或附于卷尾;中段只放陪衬之言。又过半年,吴目的判,重新准了。

---

## Concept and field

**Lost in the Middle** is a position-bias phenomenon in long-context language models, sitting in the **long-context** cluster. Liu et al. (2023, TACL 2024) showed that even models with explicitly long context windows fail to robustly use information placed in the middle of their input — accuracy traces a characteristic **U-shaped curve** as a function of where the relevant evidence is located.

## Key mechanism

The authors run two controlled probes:

1. **Multi-document QA** — the model is given *k* documents (typically 10, 20, or 30) and a question; exactly one document contains the answer. Its position is varied while everything else is held constant.
2. **Synthetic key–value retrieval** — a JSON dict of *k* random UUID→UUID pairs; the model must return the value for one queried key.

In both, accuracy is highest when the gold document/key sits at the **first** or **last** position and drops sharply — sometimes by 20–30+ points — when it sits in the middle. The effect persists for explicitly long-context variants (e.g. GPT-3.5-Turbo-16k, Claude-1.3-100k, MPT-30B-instruct), and worsens as input length grows. Strikingly, for some multi-document tasks the middle-position performance is *lower* than the closed-book baseline that sees no documents at all.

Hypothesized causes, refined by follow-up work:

- **Primacy bias** from causal-masked attention: early tokens are attended to by every subsequent token, accumulating disproportionate attention mass.
- **Recency bias** from next-token training: the model is optimized to predict what comes immediately after the most recent tokens.
- **Training-data distribution**: salient content (titles, abstracts, conclusions) tends to live at document edges, so the model learns to look there.

Follow-up work by Hsieh et al., *Found in the Middle* (ACL 2024), reframes this as a calibratable **positional attention bias** and shows that a simple post-hoc correction of attention weights recovers up to ~15 points on middle positions. Theoretical work in 2025 (Wu et al., MIT–CSAIL) derives the U-shape exactly from the interaction of causal masking with positional encodings.

## Why it matters

The result punctures a popular assumption that "longer context window = more usable context." Practical RAG and agent systems must therefore engineer document order — placing the most relevant retrieved chunks at the head or tail of the prompt, or using rerankers and calibration — rather than trusting the model to find the needle on its own. It also reframed long-context evaluation: needle-in-a-haystack tests with positional sweeps are now standard for any frontier release.

## Open questions

- Is the U-shape an inevitable consequence of causal-masked transformers, or is it largely a finetuning/data artifact that can be trained away? Evidence from 2025 suggests both contribute.
- Do reasoning-trained models (long CoT, RLVR-tuned) show a flatter curve because they re-read context in scratchpads? Early findings are mixed.

## References

- Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023/2024). *Lost in the Middle: How Language Models Use Long Contexts*. TACL. <https://arxiv.org/abs/2307.03172>
- ACL Anthology version: <https://aclanthology.org/2024.tacl-1.9/>
- Code and data: <https://github.com/nelson-liu/lost-in-the-middle>
- Follow-up coverage on architectural causes: <https://techxplore.com/news/2025-06-lost-middle-llm-architecture-ai.html>
