# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS: hand-written semantic HTML, one CSS file with custom-property tokens, dependency-free vanilla JS. No build step, no framework, no CDN. Deploy target is Cloudflare Pages, so every internal reference stays a relative path (`index.html`, `css/…`, `js/…`, `images/…`).

## Users

Primary: 2026 级新生. Two real situations, both on a phone. (1) 报到前, at home, late, anxious, searching a single concrete question ("宿舍有空调吗", "从福州站怎么走", "要带什么证件"). (2) 报到当天, standing outside the gate or in a dorm corridor, one hand on a suitcase, needing a route or a process step right now. Secondary: 家长, who scan the same pages for reassurance about safety, cost and procedure.

## Product Purpose

One senior student (小北学长) collects what freshmen actually ask and answers it in a form that can be used immediately: 报到流程 / 宿舍 / 军训 / 交通 / 选课 / 避坑 / 社团 / 开学清单, plus a local question-answering page and a follow channel. Success is a freshman who arrives on campus having already read the answer to the question they were about to ask a stranger.

## Positioning

Not an official school portal and not a news feed: a personally curated, timeline-ordered field guide, written by someone who has already walked the route once. Every policy-shaped statement is explicitly bounded ("以学校官方通知为准") instead of being dressed as authority. The Q&A is a local keyword knowledge base — no external API, no upload of what the user types.

## Operating Context

Phone-first, one-handed, high-frequency during the 报到季 (late August to mid September), often on a weak campus network, often mid-scroll while walking. Two follow channels are the only call to action: 抖音二维码 + 微信二维码. Users arrive from a 抖音 profile link, a WeChat share, or a scan, not from search engines first.

## Capabilities and Constraints

- Four pages: `index.html`, `category.html`, `ai-consult.html`, `about.html`.
- Guide entries (categories, per-entry detail content, opening checklist, news-style tips) come from the existing site's data; copy may be polished, never invented.
- AI consult is a local keyword-matching knowledge base with a keyword→entry index and a honest fallback; no network calls, no storage of user input.
- Policy, fee, address and schedule statements carry their "以学校官方通知为准" caveat and the original figures verbatim.
- Unconfirmed contact fields must not be fabricated: 公众号名称, 邮箱, 学校官网 URL and 招生入口 URL were placeholders in the incumbent site and must stay marked as such rather than being filled with guesses.
- Assets available: `campus-01..04.jpg` (real campus photos), one avatar, two QR images. The incumbent site referenced `campus-05..11` and `freshman-checklist-01/02` images that do not exist in the source mirror, and linked to a `detail.html` that was never deployed — both are broken references and must not be carried over.

## Brand Commitments

- Name: 「小北学长（福软迎新版）」. The guide person is 小北学长; the tone is 真诚、实用、接地气, explicitly anti-hype ("这里不做夸张广告").
- 抖音号 25408200778; 微信「小北学长」, labelled 福建 南平.
- The two new QR images (WeChat + Douyin) supplied by the owner are authoritative and must appear in the site's follow entry points.
- The avatar image is the person's face and stays the single identity mark.
- Disclaimer text is part of the product, not boilerplate: 内容仅供参考, 以学校官方通知为准.

## Evidence on Hand

Real: `images/campus-01..04.jpg` (4 campus photographs, 3072×4096 / 4096×3072 originals), `images/xiaobei-avatar.jpg`, the two owner-supplied QR images, and the incumbent site's guide/QA copy. Absent and therefore not claimable: official school notices, real 阅读量/用户量 numbers, testimonials, 公众号/邮箱/官网 links, and the missing `campus-05..11` / checklist photos. The incumbent's "100+ 攻略 / 20+ 问题 / 365天 陪伴" figures are decoration, not evidence; they are not carried into the new build.

## Product Principles

1. Answer first, decoration later: every screen's primary job is to make one concrete question answerable without a second tap.
2. Two situations, one page: the same page must work read-at-home and used-on-campus, so scanning beats narrative.
3. Honest boundaries: uncertain facts are labelled as uncertain, in the copy, next to the claim.
4. The guide is a route, not a list: 报到那天 has an order, and the site is allowed to say what comes first.
5. Phone-first, weak-network first: no dependency, no external font, no request that a campus network can fail.

## Accessibility & Inclusion

Keyboard-operable navigation and search; visible focus rings themed from the palette, never removed; body text ≥4.5:1 contrast on its own surface; real `alt` text for content images and empty `alt` for decoration; `prefers-reduced-motion` respected; touch targets ≥44px; 360px-wide viewport usable without horizontal scrolling; Chinese text set with a reading-first type scale and native font stack (no webfont request).
