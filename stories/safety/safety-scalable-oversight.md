---
id: safety-scalable-oversight
cluster: safety
concept: Scalable Oversight
status: done
sources:
  - https://arxiv.org/abs/2211.03540
  - https://www.alignmentforum.org/posts/nekLYqbCEBDEfbLzF/artificial-sandwiching-when-can-we-test-scalable-alignment
  - https://arxiv.org/html/2504.18530v1
  - https://arxiv.org/pdf/2407.04622
generated_at: 2026-04-25
---

老周在县城医院做了三十年内科,退休那年,儿子给他装了一台能"看片"的机器。机器是城里大医院淘汰下来的,据说在三甲医院里也算二线水平——比县医院的小张大夫强,但比省里的呼吸科主任弱。

老周自己其实早就看不动片子了。眼花,手抖,新出的那些影像学名词他也认不全。可机器送来那天,儿子说:"爸,你别退,你坐镇,机器给你打下手。"

第一个病人是邻村的王婶,咳了三个月。机器读完片,屏幕上跳出一行字:**右上肺结节,建议穿刺**。老周盯着那行字看了半天,问机器:"你凭什么这么说?"机器答:"基于八千例相似影像。"老周又问:"那你见过尘肺没有?王婶她男人在煤窑干了二十年,她跟着住了二十年。"机器顿了顿,补一句:"未排除尘肺钙化灶可能。"

老周把王婶劝去市里复查,果然是钙化,不是癌。

他渐渐摸出门道。机器不是不会错,是它错的时候,自己一点都不知道错。它说话的语气永远那么笃定。老周的办法笨:他不直接信结论,他追着机器问"为什么"、"还有没有别的可能"、"假如这个病人是七十岁吸烟男性结果会不会变"。问到第三第四层,机器有时就开始打架,前后说法对不上。那时候老周就知道,这一片不能信。

县里来检查的领导看见这场面,皱眉:"老周,你都看不动片子了,你怎么知道机器答得对不对?"老周说:"我是不知道它答得对不对。我只知道,我一个人看,看不了;它一个人看,我不敢用;我俩坐一块儿,我专门盯着它哪儿心虚,它专门替我把片子看清楚——王婶这种,我们俩加起来,刚好够省医院的水平。"

领导不信,搞了次盲测:让县里另一个老大夫单独看二十张片,让机器单独读二十张,再让老周配着机器读二十张。最后拿去省里的主任那儿对答案。结果是:老大夫错七张,机器错五张,老周加机器只错一张——那一张,是机器特别自信、老周也没追问出毛病的一张。

老周把那张片贴在墙上,提醒自己。他后来跟徒弟说:"将来你们手底下的机器,会比省里主任还厉害。到那天,你连'追着问'的本钱都没有了——你问什么,它都能编出一套你听着挺顺的话。所以现在,趁它还没那么厉害,你得先练会怎么跟一个比你聪明的东西较劲;练会了,将来它真聪明过你,你才有的指望。"

墙上那张错片,后来一直没摘。

---

## Scalable Oversight

**Field.** AI alignment / safety (cluster: `safety`). Scalable oversight is the research problem of *how a weaker supervisor — eventually, humanity — can reliably train, evaluate, and correct an AI system that is more capable than the supervisor on the very task being supervised.* It is the alignment counterpart to the capabilities curve: as models cross human expert level, ordinary RLHF labels stop being a ground truth and start being noise.

**Key mechanism — the sandwich.** Bowman et al. (2022) operationalized the problem with a clever experimental design called *sandwiching*. Pick a task where (a) **non-expert humans alone fail**, (b) **the model alone fails**, but (c) **human experts succeed**. The non-experts then play the role of "future humanity," the model plays "the superhuman system," and the experts serve only as a hidden answer key. If the non-experts can use the model — through dialogue, interrogation, decomposition — to reach expert-level accuracy, that is empirical evidence that *some* oversight protocol scales past the supervisor's solo ceiling.

In their proof-of-concept, Bowman et al. ran this on MMLU (graduate-level multiple choice) and time-limited QuALITY (long-document reading comprehension). Non-experts with chat access to an unreliable LM assistant substantially beat both the model alone and themselves alone. The "protocol" was the most trivial possible: free-form chat. The point was not that chat is the answer; the point was that the sandwich harness exists *today*, so oversight techniques can be benchmarked before the superhuman regime arrives.

**Why it matters.** Scalable oversight is the bridge between current alignment (RLHF, Constitutional AI) and proposals for the post-human-expert regime: Debate (Irving et al. 2018), Iterated Amplification (Christiano et al. 2018), Recursive Reward Modeling (Leike et al. 2018), and weak-to-strong generalization (Burns et al. 2023). All of them assume that *weak signals plus structured interaction* can elicit work the weak supervisor could not verify directly. The sandwiching paradigm gave that family of proposals a measurable foothold.

**Open questions and recent work.**
- *Does sandwiching transfer?* The capability gap between non-expert and expert humans may not behave like the gap between humans and a future superhuman model — the model can be deceptively persuasive in ways an expert cannot.
- *Scaling laws.* Hughes et al. (2025, "Scaling Laws For Scalable Oversight," arXiv:2504.18530) attempt to predict how oversight protocols degrade as the supervisor–model gap widens; results suggest some protocols (debate) scale better than others (consultancy).
- *Weak judges, strong players.* Khan et al. (2024, "On scalable oversight with weak LLMs judging strong LLMs," arXiv:2407.04622) replace human non-experts with weaker LMs and find debate outperforms consultancy, lending modest support to the debate proposal — but only modest.
- *The deceptive-model objection.* If the strong model is adversarial rather than merely fallible, sandwiching with a benign model understates the difficulty; this is the standard critique from the alignment-pessimist camp.

**Key references.**
- Bowman, S. R., et al. (2022). *Measuring Progress on Scalable Oversight for Large Language Models.* arXiv:2211.03540. https://arxiv.org/abs/2211.03540
- Cotra, A. (2021). *The case for aligning narrowly superhuman models.* (Origin of the sandwiching proposal.)
- Khan et al. (2024). *On scalable oversight with weak LLMs judging strong LLMs.* arXiv:2407.04622. https://arxiv.org/pdf/2407.04622
- Hughes et al. (2025). *Scaling Laws For Scalable Oversight.* arXiv:2504.18530. https://arxiv.org/html/2504.18530v1
