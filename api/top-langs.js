require("dotenv").config();
const {
  clampValue,
  parseArray,
  CONSTANTS,
  removeHiddenLangs,
} = require("../src/common/utils");
const fetchTopLanguages = require("../src/fetchers/top-languages-fetcher");
const renderTopLanguages = require("../src/cards/top-languages-card");
const blacklist = require("../src/common/blacklist");
const { isLocaleAvailable } = require("../src/translations");

module.exports = async (req, res) => {
  const {
    username,
    hide,
    hide_title,
    hide_border,
    card_width,
    title_color,
    text_color,
    bg_color,
    theme,
    cache_seconds,
    layout,
    langs_count,
    exclude_repo,
    custom_title,
    locale,
    border_radius,
    border_color,
  } = req.query;
  res.setHeader("Content-Type", "application/json");

  if (blacklist.includes(username)) {
      return res.json({error: "Something went wrong"});
  }

  if (locale && !isLocaleAvailable(locale)) {
      return res.json({error: "Locale not found"});
  }

  try {
    const topLangs = await fetchTopLanguages(
      username,
      parseArray(exclude_repo),
    );

    const langs = removeHiddenLangs(topLangs, parseArray(hide))

    const cacheSeconds = clampValue(
      parseInt(cache_seconds || CONSTANTS.TWO_HOURS, 10),
      CONSTANTS.TWO_HOURS,
      CONSTANTS.ONE_DAY,
    );

    res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}`);

    return res.json({languages: langs});
  } catch (err) {
      return res.json({error: err.message});
  }
};
