const STAT = {
  WIN: 'W',
  TOV: 'TO',
  BLK: 'BLK',
  STL: 'STL',
  PT2_CONVERTED: '2P',
  PT2_MISSED: '2PM',
  PT2_ATTEMPTS: '2PA',
  PT2_P: '2P%',
  PT3_CONVERTED: '3P',
  PT3_MISSED: '3PM',
  PT3_ATTEMPTS: '3PA',
  PT3_P: '3P%',
  FT_CONVERTED: 'FT',
  FT_MISSED: 'FTM',
  FT_ATTEMPTS: 'FTA',
  FT_P: 'FT%',
  REB_OFFENSIVE: 'ORB',
  REB_DEFENSIVE: 'DRB',
  REB_TOTAL: 'TRB',
  AST: 'AST',
  PASS: 'PASS',
  FOUL: 'FO',
  PTS: 'PTS',
  FB: 'FB',
  POS: 'POS',
  INJURY: 'INJ'
};

const TACTIC = {
  DEF: {
    NORM: "normal",
    SBOD: "sprint back on defense",
    CES: "contest every shot",
    BOAR: "block out and rebound",
    PPZ: "protect power zone",
    WOO: "wear out the opponents",
    HCT: "half court trap"
  },
  OFF: {
    NORM: "normal",
    RTD: "read the defense",
    FEB: "fast early breaks",
    DS: "distance shooting",
    TTP: "try to penetrate",
    CTB: "crash the boards",
    IS: "inside shooting"
  }
};

const TACTIC_SHORT = {
  "normal": 'Normal',
  "sprint back on defense": 'SBOD',
  "contest every shot": 'CES',
  "block out and rebound": 'BOAR',
  "protect power zone": 'PPZ',
  "wear out the opponents": 'WOO',
  "half court trap":'HCT',
  "read the defense": 'RTD',
  "fast early breaks": 'FEB',
  "distance shooting": 'DS',
  "try to penetrate": 'TTP',
  "crash the boards": 'CTB',
  "inside shooting": 'IS'
};

const STAT_ORDER = [STAT.PTS, STAT.PT2_CONVERTED, STAT.PT2_ATTEMPTS, STAT.PT2_P, STAT.PT3_CONVERTED, STAT.PT3_ATTEMPTS,
  STAT.PT3_P, STAT.FT_CONVERTED, STAT.FT_ATTEMPTS, STAT.FT_P, STAT.REB_DEFENSIVE, STAT.REB_OFFENSIVE, STAT.REB_TOTAL,
  STAT.AST, STAT.FOUL, STAT.STL, STAT.TOV, STAT.BLK];

const DENOMINATIONS = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good',
  'very good', 'great', 'extremely great', 'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal',
  'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];

export { STAT, DENOMINATIONS, STAT_ORDER, TACTIC_SHORT };