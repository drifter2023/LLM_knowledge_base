---
id: arch-tokenization
cluster: arch
concept: Tokenization (BPE, SentencePiece, Tiktoken, Byte Latent Transformer)
status: done
sources:
  - https://arxiv.org/abs/1508.07909
  - https://arxiv.org/abs/1808.06226
  - https://arxiv.org/abs/2412.09871
  - https://github.com/openai/tiktoken
  - https://en.wikipedia.org/wiki/Glitch_token
generated_at: 2026-04-25
---

老镇上有一家做了三代人的活字印刷铺,招牌叫"合字斋"。

第一代掌柜是个节俭的老头。他发现客人订的稿子里,"之乎者也"出现得最频繁,于是把这四个字各刻成一枚铜活字;再发现"先生"两字总是连用,就索性把"先生"合刻成一枚;接着"老先生""孔先生""赵先生"里那个"先生"也都用这枚合字。他每晚清点字盘,把出现次数最多的两枚相邻铜字熔在一起,铸成新字;新字若再频繁与谁并肩,就再熔一次。几十年下来,字盘里既有"一""二"这样的单字,也有"恭喜发财""不亦乐乎"这样的整块大铜板。寻常稿子,十几块铜板就拼完一行,省时省力。

第二代掌柜进了一步。父亲的铜板毕竟是从"先把字句切成词"那一步开始算的——遇到没有空格的洋文、或是日本来的假名混排,父亲就抓瞎。儿子干脆把所有稿件先按笔画原子拆到底,连标点和空格都当成铜字看待,再让熔字的规则自己跑。他还发明了一种"反向修剪法":先铸出极多的候选铜板,挂在墙上,再算每一块对印整本书有多大贡献,贡献最低的随时摘下来回炉。这样字盘里留下的,都是"性价比"最高的合字。客人从波斯文到爪哇文,他都能接。

第三代掌柜年轻气盛,本不想守这家铺子。可有一天他遇见两件怪事。

头一件:有位客人姓氏极冷僻,镇上从未刻过。铺里只能把那姓氏拆成最小的几片偏旁去拼,印出来歪歪扭扭。客人拂袖而去。

第二件更怪。爷爷年轻时,有个叫"金鱼大仙"的网名在某本旧账本里出现了上千次,于是爷爷给它单铸了一块铜板。后来那网名再没人用过,这块铜板从不进墨,可它仍然占着字盘的位置。某天小学徒不小心把它放进稿件,机器竟印出一连串胡话——它早被遗忘,却没被销毁,墨色一上去就乱套。

年轻掌柜盯着那块僵尸铜板,忽然想:为什么非得有"字"这一层?客人交来的稿子,本质上不过是一串墨点的开关——黑、白、黑、黑、白。何必预先规定哪几个开关要焊成一块?他造了一台新机器:扫描墨点流时,如果接下来一段开关变化平稳、容易猜,机器就一口气吞下长长一段当作一块;一旦扫描到难以预测的位置——比如那个冷僻姓氏的第一笔——机器就缩短步幅,小心翼翼地一格一格读。块的边界由"下一格有多难猜"实时决定,字盘里再没有预先铸好的铜板,也就没有僵尸,没有拼不出的姓氏。

他把铺子的招牌摘下来,新挂的牌子上没有字,只有一道由疏到密、由密到疏的墨点。

---

## Concept and field

**Tokenization** is the input-representation layer of every modern language model — part of the **Architecture** cluster. It decides how raw text (or raw bytes) is chopped into the discrete units a transformer actually consumes. The choice is load-bearing: it sets vocabulary size, sequence length, multilingual fairness, arithmetic ability, and the model's exposure to "glitch tokens."

## Key mechanism

Three generations dominate production systems, and a fourth is now challenging the whole premise:

1. **Byte-Pair Encoding (BPE)** — Sennrich, Haddow & Birch (2016) repurposed a 1994 compression algorithm: start from characters, repeatedly merge the most frequent adjacent pair into a new symbol, stop at a target vocabulary size. Frequent strings ("ing", " the") become single tokens; rare strings decompose into shorter pieces. OpenAI's **tiktoken** is a fast BPE implementation operating on **bytes** rather than Unicode characters, so any input is representable; the `cl100k_base` and `o200k_base` encodings power GPT-3.5/4/4o.
2. **SentencePiece + Unigram LM** — Kudo & Richardson (2018) removed the requirement that input be pre-tokenized into words (critical for Chinese, Japanese, Thai). Their **unigram LM** variant inverts BPE's logic: start with a large candidate vocabulary, then iteratively prune the tokens that contribute least to corpus likelihood under EM. This also enables **subword regularization** — sampling alternative segmentations during training as data augmentation.
3. **Glitch tokens** — Tokens like `SolidGoldMagikarp` were carved out by the GPT-2 tokenizer because the string was frequent in the *tokenizer training* corpus, but rare in the *model* training corpus. Their embeddings remained near the centroid, producing bizarre behavior at inference. This is one symptom of the deeper problem: a frozen, statically-learned vocabulary is brittle, wastes capacity, and fragments digits in ways that hurt arithmetic.
4. **Byte Latent Transformer (BLT)** — Pagnoni et al. (Meta, 2024) propose a tokenizer-free architecture. A small byte-level model computes the **entropy of the next byte**; whenever entropy spikes, a **patch boundary** is drawn. Bytes within a patch are pooled by a *local encoder* into one latent vector; a large *latent transformer* operates on patches; a *local decoder* expands each patch back to bytes. Patches are long where text is predictable (saving FLOPs) and short where it is hard (spending compute where needed). The first FLOP-controlled scaling study up to 8B params / 4T training bytes shows BLT matches Llama-3-style BPE models and scales better at fixed inference cost.

## Why it matters

Tokenization is the unglamorous layer that bottlenecks almost everything else: rare-word translation, code, multilingual equity, character-level reasoning, robustness to typos, and even the cost of an API call (priced per token). Moving the boundary from "fixed vocabulary chosen before training" to "boundary chosen dynamically by entropy" is potentially the same kind of unlock that going from word-level to subword-level was in 2016.

## Open questions / controversies

- **Does BLT really beat BPE end-to-end at frontier scale?** The 8B / 4T-byte study is FLOP-controlled but still small by 2026 standards; replication at trillion-parameter scale is pending.
- **Tokenizer-induced biases** in multilingual fairness (some languages cost 2-5× more tokens per equivalent meaning) remain unsolved even in modern BPE.
- **Glitch-token-style failures** still surface in newer tokenizers (LessWrong's `SmartyHeaderCode` work on GPT-3.5/4) — proving the problem is structural, not a one-off bug.

## References

- Sennrich, R., Haddow, B., & Birch, A. (2016). *Neural Machine Translation of Rare Words with Subword Units.* ACL. https://arxiv.org/abs/1508.07909
- Kudo, T., & Richardson, J. (2018). *SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing.* EMNLP demo. https://arxiv.org/abs/1808.06226
- Pagnoni, A., et al. (2024). *Byte Latent Transformer: Patches Scale Better Than Tokens.* arXiv:2412.09871. https://arxiv.org/abs/2412.09871
- OpenAI. *tiktoken* (BPE tokenizer for GPT-3.5/4/4o). https://github.com/openai/tiktoken
- *Glitch token* (SolidGoldMagikarp and related anomalies). Wikipedia. https://en.wikipedia.org/wiki/Glitch_token
