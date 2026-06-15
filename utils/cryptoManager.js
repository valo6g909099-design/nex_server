// function updatePortfolioAmount(portfolio, updates) {
//   const newPortfolio = { ...portfolio };
//   Object.keys(updates).forEach((key) => {
//     if (!newPortfolio[key]) return;
//     const newAmount = updates[key]?.amount ?? newPortfolio[key].amount;
//     newPortfolio[key] = {
//       ...newPortfolio[key],
//       amount: newAmount,
//       value_usd: +(newAmount * newPortfolio[key].price_usd).toFixed(2),
//     };
//   });

//   return newPortfolio;
// }




function updatePortfolioAmount(portfolio, updates) {
  const newPortfolio = { ...portfolio };

  Object.keys(updates).forEach((key) => {
    if (!newPortfolio[key]) return;
    const newAmount = updates[key]?.amount ?? newPortfolio[key].amount;
    newPortfolio[key] = {
      ...newPortfolio[key],
      amount: newAmount,
      value_usd: +(newAmount * newPortfolio[key].price_usd).toFixed(2),
    };
  });

  const totalValue = Object.values(newPortfolio).reduce(
    (sum, coin) => sum + coin.value_usd,
    0
  );

  Object.keys(newPortfolio).forEach((key) => {
    const coin = newPortfolio[key];
    const percentage =
      totalValue > 0
        ? +((coin.value_usd / totalValue) * 100).toFixed(2)
        : 0;

    newPortfolio[key] = {
      ...coin,
      items: {
        percentage,           
        fill: percentage,    
        value_usd: coin.value_usd,      
        price_usd: coin.price_usd,      
        total_usd: +totalValue.toFixed(2), 
      },
    };
  });

  return newPortfolio;
}







function comparePortfolio(prevData, newData) {
  let totalPrev = 0;
  let totalNew = 0;

  const items = {};

  Object.keys(newData).forEach((key) => {
    const prev = prevData[key];
    const curr = newData[key];

    if (!prev || !curr) return;

    const amount = prev.amount || 0;

    const priceDiff = +(curr.price_usd - prev.price_usd).toFixed(2);
    const priceRate = prev.price_usd
      ? +((priceDiff / prev.price_usd) * 100).toFixed(2)
      : 0;

    const prevValue = +(amount * prev.price_usd).toFixed(2);
    const newValue = +(amount * curr.price_usd).toFixed(2);

    const valueDiff = +(newValue - prevValue).toFixed(2);
    const valueRate = prevValue
      ? +((valueDiff / prevValue) * 100).toFixed(2)
      : 0;

    items[key] = {
      name: curr.name,
      amount,

      prev_price: prev.price_usd,
      new_price: curr.price_usd,
      price_change: priceDiff,
      price_change_percent: priceRate,

      prev_value: prevValue,
      new_value: newValue,
      value_change: valueDiff,
      value_change_percent: valueRate,

      trend: priceDiff >= 0 ? "up" : "down",
    };

    totalPrev += prevValue;
    totalNew += newValue;
  });

  const totalChange = +(totalNew - totalPrev).toFixed(2);
  const totalRate = totalPrev
    ? +((totalChange / totalPrev) * 100).toFixed(2)
    : 0;

  return {
    items,
    totalPrev: +totalPrev.toFixed(2),
    totalNew: +totalNew.toFixed(2),
    totalChange,
    totalRate,
    marketTrend: totalChange >= 0 ? "up" : "down",
  };
}

function rand(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

const basePrices = {
  BTC: 60000,
  ETH: 3200,
  SOL: 140,
  AVAX: 45,
  LINK: 20,
  DOT: 10,
  UNI: 9,
};

function createTimeline(price) {
  const periods = ["15m", "1h", "1d", "1w", "1m", "1y"];

  const generatePoints = (basePrice, count = 20) => {
    return Array.from({ length: count }, () =>
      +(basePrice * rand(0.92, 1.08)).toFixed(2)
    );
  };

  const empty = () =>
    Object.fromEntries(periods.map((p) => [p, generatePoints(price)]));

  return { current_value: empty(), exchange_value: empty() };
}

function createCryptoData() {
  const btcPrice = rand(basePrices.BTC * 0.95, basePrices.BTC * 1.05);
  const ethPrice = rand(3000, 3400);
  const solPrice = rand(120, 160);
  const avaxPrice = rand(40, 55);
  const linkPrice = rand(18, 22);
  const dotPrice = rand(9, 12);
  const uniPrice = rand(8, 10);

  const t = (price) => createTimeline(price);

  const data = {
    USD: {
      name: "USD",
      amount: 0,
      price_usd: 1,
      value_usd: 0,
      id: "usd",
      symbol: "$",
      style:
        "background:rgba(38,166,91,.1);border:1px solid rgba(38,166,91,.2);color:#26a65b",
      timeline: t(1),
    },

    BTC: {
      name: "Bitcoin",
      amount: 0,
      price_usd: btcPrice,
      value_usd: 0,
      id: "btc",
      symbol: "₿",
      style:
        "background:rgba(247,147,26,.13);border:1px solid rgba(247,147,26,.28);color:#f7931a",
      timeline: t(btcPrice),
    },

    ETH: {
      name: "Ethereum",
      amount: 0,
      price_usd: ethPrice,
      value_usd: 0,
      id: "eth",
      symbol: "Ξ",
      style:
        "background:rgba(98,126,234,.13);border:1px solid rgba(98,126,234,.28);color:#627EEA",
      timeline: t(ethPrice),
    },

    SOL: {
      name: "Solana",
      amount: 0,
      price_usd: solPrice,
      value_usd: 0,
      id: "sol",
      symbol: "◎",
      style:
        "background:rgba(0,230,180,.1);border:1px solid rgba(0,230,180,.2);color:#00e6b4",
      timeline: t(solPrice),
    },

    AVAX: {
      name: "Avalanche",
      amount: 0,
      price_usd: avaxPrice,
      value_usd: 0,
      id: "avax",
      symbol: "◈",
      style:
        "background:rgba(232,65,66,.1);border:1px solid rgba(232,65,66,.2);color:#e84142",
      timeline: t(avaxPrice),
    },

    LINK: {
      name: "Chainlink",
      amount: 0,
      price_usd: linkPrice,
      value_usd: 0,
      id: "link",
      symbol: "⬡",
      style:
        "background:rgba(42,90,218,.1);border:1px solid rgba(42,90,218,.2);color:#2a5ada",
      timeline: t(linkPrice),
    },

    DOT: {
      name: "Polkadot",
      amount: 0,
      price_usd: dotPrice,
      value_usd: 0,
      id: "dot",
      symbol: "●",
      style:
        "background:rgba(230,0,122,.1);border:1px solid rgba(230,0,122,.2);color:#e6007a",
      timeline: t(dotPrice),
    },

    UNI: {
      name: "Uniswap",
      amount: 0,
      price_usd: uniPrice,
      value_usd: 0,
      id: "uni",
      symbol: "U",
      style:
        "background:rgba(255,0,122,.1);border:1px solid rgba(255,0,122,.2);color:#ff007a",
      timeline: t(uniPrice),
    },
  };

  Object.keys(data).forEach((key) => {
    data[key].value_usd = +(data[key].amount * data[key].price_usd).toFixed(2);
  });

  return data;
}

module.exports = { createCryptoData, comparePortfolio, updatePortfolioAmount };