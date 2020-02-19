const moment = require('moment')

const fetchStats = async (client) => {
    const today = moment().format('YYYYMMDD');
    const week = moment().format('w');
    console.log(week)
    let submittedCheckout = await client.get(`checkout:submitted${today}`);
    let errorCheckout = await client.get(`checkout:error${today}`);
    let totalCheckout = await client.get(`checkout:total-created${today}`);
    let items = await client.zrevrange(`checkout:popular${today}`, 0, 3, 'WITHSCORES');

    let submittedCheckoutWeekly = await client.get(`checkout:submittedweek${week}`);
    let errorCheckoutWeekly = await client.get(`checkout:errorweek${week}`);
    let totalCheckoutWeekly = await client.get(`checkout:total-createdweek${week}`);
    let itemsWeekly = await client.zrevrange(`checkout:popularweek${week}`, 0, 3, 'WITHSCORES');


    let top3 = items.reduce((acc, item, index) => {
        if (index % 2) return acc
        acc.push({
          count: Number(items[index + 1]),
          name: item
        })
        return acc
      }, [])

    let top3Weekly = itemsWeekly.reduce((acc, item, index) => {
        if (index % 2) return acc
        acc.push({
            count: Number(items[index + 1]),
            name: item
        })
        return acc
    }, [])
    return {
        daily: {
            submittedCheckout,
            errorCheckout,
            totalCheckout,
            top3
        },
        weekly: {
            submittedCheckout: submittedCheckoutWeekly,
            errorCheckout: errorCheckoutWeekly,
            totalCheckout: totalCheckoutWeekly,
            top3: top3Weekly
        }
    }
}

  module.exports = {
    fetchStats,
  }