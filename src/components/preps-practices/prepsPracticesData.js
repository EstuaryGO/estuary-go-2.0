export const HEADER_THUMBNAIL =
  "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/090f1c1e5_uywfLHTMStCut8jtQOfv_7PracticesThumb.jpg";

export const PREP_INTRO_THUMBNAIL =
  "https://i.vimeocdn.com/video/2171596428-c862ee39aadc4c33ecde98fb1d30a6a1c5bb9f21d8af40e89de71bb8854eaeb1-d_1280?region=us";

export const PRACTICE_INTRO_THUMBNAIL =
  "https://i.vimeocdn.com/video/2171633303-f61fd81de2056b717caa0a6a5f2bd97e90877285624ecd0b2a28d3e2d5d0123b-d_1280?region=us";

export const PREP_SUB_THUMBS = {
  "GO! Prep 1":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b925be268_DCoGeXmTMeBnIZkcyoZ0_prep1thumnail-1.png",
  "GO! Prep 2":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/ae0ab1c26_QMrFhgKsSz6qDXJAtRCr_Prep2Thumbnail.png",
  "GO! Prep 3":
    "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/aba822cd2_gYxLlPjRS66M53tHwk7b_Prep3Thumnbnail.png",
};

export const PRACTICE_SUB_THUMBS = {
  "GO! Practice 1": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/b7b3b653a_Practice1.jpg",
  "GO! Practice 2": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/3bc97e3da_Practice2.jpg",
  "GO! Practice 3": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/a7ecac510_Practice3.jpg",
  "GO! Practice 4": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/4c8b33972_Practice4.jpg",
  "GO! Practice 5": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/f00cd4fd2_Practice5.jpg",
  "GO! Practice 6": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/d0f190865_Practice6.jpg",
  "GO! Practice 7": "https://media.base44.com/images/public/6a1204d6712923c845a17a9d/9dca026d0_Practice7.jpg",
};

export const PREP_SUBCATS = {
  "GO! Prep 1": ["GO! Prep 1.1", "GO! Prep 1.2", "GO! Prep 1.3", "GO! Prep 1.4"],
  "GO! Prep 2": ["GO! Prep 2.1", "GO! Prep 2.2", "GO! Prep 2.3", "GO! Prep 2.4"],
  "GO! Prep 3": ["GO! Prep 3.1", "GO! Prep 3.2", "GO! Prep 3.3", "GO! Prep 3.4"],
};

export const PRACTICE_SUBCATS = {
  "GO! Practice 1": { subtitle: "Go Together", modules: ["Go Together 1.1", "Go Together 1.2", "Go Together 1.3", "Go Together 1.4", "Go Together 1.5"] },
  "GO! Practice 2": { subtitle: "Pray Together", modules: ["Pray Together 2.1", "Pray Together 2.2", "Pray Together 2.3", "Pray Together 2.4"] },
  "GO! Practice 3": { subtitle: "Discover Practical Needs", modules: ["Discover Practical Needs 3.1", "Discover Practical Needs 3.2", "Discover Practical Needs 3.3", "Discover Practical Needs 3.4", "Discover Practical Needs 3.5"] },
  "GO! Practice 4": { subtitle: "Love In Action", modules: ["Love In Action 4.1", "Love In Action 4.2", "Love In Action 4.3", "Love In Action 4.4", "Love In Action 4.5"] },
  "GO! Practice 5": { subtitle: "Discover Their Story", modules: ["Discover Their Story 5.1", "Discover Their Story 5.2", "Discover Their Story 5.3"] },
  "GO! Practice 6": { subtitle: "Speak of Jesus", modules: ["Speak of Jesus 6.1", "Speak of Jesus 6.2", "Speak of Jesus 6.3", "Speak of Jesus 6.4", "Speak of Jesus 6.5", "Speak of Jesus 6.6", "Speak of Jesus 6.7"] },
  "GO! Practice 7": { subtitle: "A Flourishing Community", modules: ["A Flourishing Community 7.1", "A Flourishing Community 7.2", "A Flourishing Community 7.3", "A Flourishing Community 7.4"] },
};

export function getEmbedUrl(url) {
  if (!url) return null;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}