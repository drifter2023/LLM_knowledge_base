---
id: arch-moe
cluster: arch
concept: Mixture of Experts (MoE)
status: done
sources:
  - https://arxiv.org/abs/2101.03961
  - https://arxiv.org/abs/2006.16668
  - https://arxiv.org/abs/2412.19437
  - https://arxiv.org/abs/2401.04088
  - https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts
generated_at: 2026-04-25
---

镇上新开的那家医馆,门面不大,却号称"百症皆治"。

老掌柜姓林,本是城里翰林院退下来的医官。他不亲自看诊,而是坐在大堂正中一张八仙桌后,只做一件事:听人说三句话,然后抬手一指,把病人分到后院八间小屋之一。

后院的八位郎中,各有所长:头一位专攻风寒,第二位精于跌打,第三位擅治小儿,第四位看妇人病,第五位调脾胃,第六位疗目疾,第七位管老年人的腰腿,第八位最年轻,专看外乡人带来的怪症。八间屋彼此不通,郎中们也互不打听各自看了什么病人。

林掌柜的本事就在这"指一指"上。病人一进门,把症状说出口的瞬间,他脑中似有一杆秤,八个砝码各有轻重,最重的两个落下,他便点头:"你去三号屋,再去五号屋。"两位郎中各开一张方子,药童在前堂把两张方子合在一起,按比例抓药,熬成一碗端给病人。

镇上人起初不信。一家医馆养八个郎中,人吃马嚼,药材损耗,如何撑得下去?林掌柜笑而不语。日子久了,大家才看出门道:这医馆一天能接三百号病人,而对面老字号"济世堂"满堂坐着两位老中医,从早忙到晚也不过看五十人。林掌柜的八位郎中,谁也没累着——因为每位郎中一天只接到三五十个最对路的病人,旁的全被分流走了。每一碗药,只用两位郎中的脑子;可若把全镇的病一并算上,八位郎中的本事都用上了。

只是这买卖也有难处。第三号郎中是个名医,病人一听"三号"两字便心安,渐渐地,林掌柜手一指,十有七八指向三号。三号屋外排起长队,药童在前堂急得跺脚,而六号屋的郎中坐在屋里打盹,一上午没接到一个人。林掌柜看在眼里,夜里翻出一本小册子,在三号那一栏旁悄悄记下一个负数,在六号那一栏记下一个正数——次日他再"指一指"时,心中那杆秤便自动偏一偏,把本来要去三号的病人,匀出一些给六号。他从不告诉两位郎中这件事,也不在账本上摊派任何"罚金",只是悄悄把秤砣挪一挪。一个月下来,八间屋的人流竟均了。

镇上有人写诗赞他:"门前一指分八路,药出双方合一炉。养士千人不知用,用时只在两三呼。"

诗写得太满。其实林掌柜也有忧心事。他常对徒弟说:你看,我们号称"百症皆治",八位郎中加起来确是百症的本事。可若有一天,一个病人来,症状刁钻得很,我那一指,究竟是真的看准了,还是只挑了最像的两位糊弄过去?天底下的怪病,远不止八种。我们能省下的,是病人不必把八位郎中都见一遍;省不下的,是这一指本身,得指得准。

——徒弟点点头,记在心里。

---

## Mixture of Experts (MoE)

**Field.** Model architecture (cluster `arch`). MoE replaces the dense feed-forward (FFN) sub-layer of a Transformer block with a bank of *N* parallel FFNs ("experts") plus a learned **router** (gating network). For every token, the router selects a small subset *k* ≪ *N* of experts to actually run; the remaining experts contribute zero compute. The model therefore has a large *total* parameter count but a much smaller *activated* parameter count per token — the pattern the parable's Lin Zhanggui dramatizes by hiring eight specialists but consulting only two per patient.

**Mechanism.**

1. **Routing.** Given token representation *x*, the router computes logits *x · W_g*, takes a TopK, and softmaxes the survivors: G(x) = Softmax(TopK(x · W_g, k)). The token's output is the weighted sum Σᵢ G(x)ᵢ · Eᵢ(x) over the chosen experts.
2. **Top-k choice.** GShard (Lepikhin et al. 2020) used top-2; Switch Transformer (Fedus, Zoph, Shazeer 2021) showed that top-1 also works and halves communication; Mixtral 8×7B (Jiang et al. 2024) returned to top-2 over 8 experts (47 B total / 13 B active); DeepSeek-V3 (DeepSeek-AI 2024) uses many fine-grained experts plus always-on *shared* experts (671 B total / 37 B active).
3. **Expert capacity & token dropping.** Because experts live on different devices, each is given a fixed buffer per batch (capacity factor × tokens / N). Tokens that overflow are dropped to the residual stream, motivating capacity tuning.
4. **Load balancing.** Naïve routers collapse onto a few popular experts (the parable's Room 3 problem). GShard and Switch add an *auxiliary load-balance loss* L_aux ∝ Σᵢ fᵢ · Pᵢ, where fᵢ is the fraction of tokens routed to expert i and Pᵢ is the mean router probability for i. DeepSeek-V3 *eliminates* this loss and instead maintains a per-expert **bias term** added only to the routing logits (not to gate weights or gradients), nudged up or down each step based on observed under/over-utilization — exactly the "secret notebook" Lin Zhanggui keeps.

**Why it matters.** MoE breaks the linear coupling between parameters and FLOPs. GShard scaled multilingual translation past 600 B parameters in 4 days on 2048 TPUs. Switch Transformer reached 1.6 T parameters with 7× pre-training speedup over T5. Mixtral demonstrated a 47 B sparse model beating Llama-2 70 B at a fraction of inference cost, and DeepSeek-V3 showed competitive frontier performance for ~2.79 M H800 GPU-hours — economics impossible with a dense model of equivalent capacity.

**Open questions.** (i) Does the router actually specialize meaningfully, or does it cluster on superficial token features? Switch Transformer reports only weak interpretable specialization. (ii) Auxiliary-loss-free balancing (DeepSeek-V3) is empirically promising but lacks the theoretical guarantees of L_aux; whether it remains stable at larger scales is open. (iii) Fine-grained vs. coarse experts: DeepSeek-V3's many-small-experts-plus-shared-expert design contradicts the Mixtral-style few-large-experts design, and there is no consensus on the right granularity. (iv) MoE inference is memory-bound (all experts must be resident even though few run), which complicates edge deployment.

## References

- Fedus, Zoph & Shazeer (2021). *Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity.* https://arxiv.org/abs/2101.03961
- Lepikhin et al. (2020). *GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding.* https://arxiv.org/abs/2006.16668
- DeepSeek-AI (2024). *DeepSeek-V3 Technical Report.* https://arxiv.org/abs/2412.19437
- Jiang et al. (2024). *Mixtral of Experts.* https://arxiv.org/abs/2401.04088
- Grootendorst, M. *A Visual Guide to Mixture of Experts (MoE).* https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts
