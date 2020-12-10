// Import an out-the-box Javascript package which allows me
// to read files on my local computer
const fs = require('fs')
// Import a package to help me read/write to CSV
const parse = require('csv-parse')

// Import a package which allows me to launch a Chrome instance
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Create the CSV and key the columns as I'll need to refer
// to them later
const csvWriter = createCsvWriter({
    path: 'msp_results1.csv',
    header: [
        { id: 'msp', title: 'MSP' },
        { id: 'party', title: 'Party' },
        { id: 'has_party', title: 'Mentions party' },
        { id: 'bio', title: 'Biography' },
    ]
});

// This function was a double check for me
function contains(target, pattern) {
    let str = [];
    // Get a paragraph of text, in this cases, the MP's biography
    // from Twitter, and make it all lowercase.
    const paragraph = target.toLowerCase();

    // Check if it contains any of a group of words that I
    // pass into this function
    pattern.forEach((word) => {
        if (paragraph.includes(word)) {
            str.push(word);
        }
    })

    return str.join(', ');
}

const scraper = (async (site) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(site, { waitUntil: 'load' });

    const { msp, party, twitterHandle } = await page.evaluate(() => {
        const social = document.getElementsByClassName('person-header__about__media');
        const name = document.getElementsByClassName('person-header__about__name')[0];
        const role = document.getElementsByClassName('person-header__about__position__role')[0];

        return {
            msp: name ? name.innerText : 'NOT FOUND',
            party: role ? role.innerText : 'NOT FOUND',
            twitterHandle: social && social[0] ? social[0].innerText : ''
        }
    })

    if (twitterHandle === '') {
        csvWriter.writeRecords([{
            msp,
            party,
            has_party: null,
            bio: '',
        }]);
    } else {
        const twitterUrl = `https://www.twitter.com/${twitterHandle}`;
        await page.goto(twitterUrl, { waitUntil: 'load' });

        // HANDLE TWITTER
        await page.waitForSelector('div[data-testid="UserDescription"]')
            .catch(() => {
                csvWriter.writeRecords([{
                    msp,
                    party,
                    has_party: null,
                    bio: '',
                }]);

                return Promise.resolve();
            });

        const bio = await page.evaluate(() => {
            const text = document.querySelector('[data-testid="UserDescription"]');
            if (!text) {
                return '';
            }

            return text.innerText;
        });

        csvWriter.writeRecords([{
            msp,
            party,
            has_party: contains(
                bio,
                ['conservative', 'scup', 'tory', 'tories', 'labour', 'slab', 'lib dem', 'libdems', 'liberal democrats', 'lib dems', 'snp', 'scottish national party', 'scottish national'])
                .length > 0,
            bio,
        }]);
    }

    await browser.close()
        .then(() => Promise.resolve());
});

const mspPages = [
    "https://www.theyworkforyou.com/mp/25072/george_adam",
    "https://www.theyworkforyou.com/mp/25073/clare_adamson",
    "https://www.theyworkforyou.com/mp/13947/alasdair_allan",
    "https://www.theyworkforyou.com/mp/25491/tom_arthur",
    "https://www.theyworkforyou.com/mp/13949/jackie_baillie",
    "https://www.theyworkforyou.com/mp/13951/claire_baker",
    "https://www.theyworkforyou.com/mp/25492/jeremy_balfour",
    "https://www.theyworkforyou.com/mp/25712/michelle_ballantyne",
    "https://www.theyworkforyou.com/mp/25090/claudia_beamish",
    "https://www.theyworkforyou.com/mp/25074/colin_beattie",
    "https://www.theyworkforyou.com/mp/25076/neil_bibby",
    "https://www.theyworkforyou.com/mp/25599/bill_bowman",
    "https://www.theyworkforyou.com/mp/13956/sarah_boyack",
    "https://www.theyworkforyou.com/mp/25494/miles_briggs",
    "https://www.theyworkforyou.com/mp/13961/keith_brown",
    "https://www.theyworkforyou.com/mp/25495/alexander_burnett",
    "https://www.theyworkforyou.com/mp/25496/donald_cameron",
    "https://www.theyworkforyou.com/mp/13966/aileen_campbell",
    "https://www.theyworkforyou.com/mp/13967/jackson_carlaw",
    "https://www.theyworkforyou.com/mp/25497/finlay_carson",
    "https://www.theyworkforyou.com/mp/25498/peter_chapman",
    "https://www.theyworkforyou.com/mp/13968/willie_coffey",
    "https://www.theyworkforyou.com/mp/25500/alex_cole-hamilton",
    "https://www.theyworkforyou.com/mp/13969/angela_constance",
    "https://www.theyworkforyou.com/mp/25501/maurice_corry",
    "https://www.theyworkforyou.com/mp/13971/bruce_crawford",
    "https://www.theyworkforyou.com/mp/10148/roseanna_cunningham",
    "https://www.theyworkforyou.com/mp/25080/ruth_davidson",
    "https://www.theyworkforyou.com/mp/25502/ash_denham",
    "https://www.theyworkforyou.com/mp/25081/graeme_dey",
    "https://www.theyworkforyou.com/mp/13977/bob_doris",
    "https://www.theyworkforyou.com/mp/25082/james_dornan",
    "https://www.theyworkforyou.com/mp/25085/annabelle_ewing",
    "https://www.theyworkforyou.com/mp/13980/fergus_ewing",
    "https://www.theyworkforyou.com/mp/13982/linda_fabiani",
    "https://www.theyworkforyou.com/mp/25086/mary_fee",
    "https://www.theyworkforyou.com/mp/25087/neil_findlay",
    "https://www.theyworkforyou.com/mp/25088/john_finnie",
    "https://www.theyworkforyou.com/mp/13987/joe_fitzpatrick",
    "https://www.theyworkforyou.com/mp/25504/kate_forbes",
    "https://www.theyworkforyou.com/mp/13991/murdo_fraser",
    "https://www.theyworkforyou.com/mp/25505/jeane_freeman",
    "https://www.theyworkforyou.com/mp/13994/kenneth_gibson",
    "https://www.theyworkforyou.com/mp/25506/jenny_gilruth",
    "https://www.theyworkforyou.com/mp/25507/maurice_golden",
    "https://www.theyworkforyou.com/mp/25503/mairi_gougeon",
    "https://www.theyworkforyou.com/mp/14000/christine_grahame",
    "https://www.theyworkforyou.com/mp/14001/rhoda_grant",
    "https://www.theyworkforyou.com/mp/14002/iain_gray",
    "https://www.theyworkforyou.com/mp/25508/jamie_greene",
    "https://www.theyworkforyou.com/mp/25509/ross_greer",
    "https://www.theyworkforyou.com/mp/25089/mark_griffin",
    "https://www.theyworkforyou.com/mp/25715/jamie_halcro_johnston",
    "https://www.theyworkforyou.com/mp/25510/rachael_hamilton",
    "https://www.theyworkforyou.com/mp/25511/emma_harper",
    "https://www.theyworkforyou.com/mp/25512/alison_harris",
    "https://www.theyworkforyou.com/mp/14006/patrick_harvie",
    "https://www.theyworkforyou.com/mp/25513/clare_haughey",
    "https://www.theyworkforyou.com/mp/14009/jamie_hepburn",
    "https://www.theyworkforyou.com/mp/14012/fiona_hyslop",
    "https://www.theyworkforyou.com/mp/25514/daniel_johnson",
    "https://www.theyworkforyou.com/mp/25091/alison_johnstone",
    "https://www.theyworkforyou.com/mp/14022/james_kelly",
    "https://www.theyworkforyou.com/mp/25515/liam_kerr",
    "https://www.theyworkforyou.com/mp/14024/bill_kidd",
    "https://www.theyworkforyou.com/mp/14025/johann_lamont",
    "https://www.theyworkforyou.com/mp/25516/monica_lennon",
    "https://www.theyworkforyou.com/mp/25517/richard_leonard",
    "https://www.theyworkforyou.com/mp/25518/gordon_lindhurst",
    "https://www.theyworkforyou.com/mp/14029/richard_lochhead",
    "https://www.theyworkforyou.com/mp/25519/dean_lockhart",
    "https://www.theyworkforyou.com/mp/25093/richard_lyle",
    "https://www.theyworkforyou.com/mp/25094/angus_macdonald",
    "https://www.theyworkforyou.com/mp/25095/gordon_macdonald",
    "https://www.theyworkforyou.com/mp/14034/lewis_macdonald",
    "https://www.theyworkforyou.com/mp/25521/fulton_macgregor",
    "https://www.theyworkforyou.com/mp/14035/kenneth_macintosh",
    "https://www.theyworkforyou.com/mp/25096/derek_mackay",
    "https://www.theyworkforyou.com/mp/25522/rona_mackay",
    "https://www.theyworkforyou.com/mp/25523/ben_macpherson",
    "https://www.theyworkforyou.com/mp/25524/ruth_maguire",
    "https://www.theyworkforyou.com/mp/25100/jenny_marra",
    "https://www.theyworkforyou.com/mp/25525/gillian_martin",
    "https://www.theyworkforyou.com/mp/25101/john_mason",
    "https://www.theyworkforyou.com/mp/25714/tom_mason",
    "https://www.theyworkforyou.com/mp/14043/michael_matheson",
    "https://www.theyworkforyou.com/mp/25102/joan_mcalpine",
    "https://www.theyworkforyou.com/mp/14046/liam_mcarthur",
    "https://www.theyworkforyou.com/mp/25104/mark_mcdonald",
    "https://www.theyworkforyou.com/mp/25527/ivan_mckee",
    "https://www.theyworkforyou.com/mp/14056/christina_mckelvie",
    "https://www.theyworkforyou.com/mp/14060/stuart_mcmillan",
    "https://www.theyworkforyou.com/mp/14062/pauline_mcneill",
    "https://www.theyworkforyou.com/mp/14065/margaret_mitchell",
    "https://www.theyworkforyou.com/mp/25529/edward_mountain",
    "https://www.theyworkforyou.com/mp/25530/oliver_mundell",
    "https://www.theyworkforyou.com/mp/14071/alex_neil",
    "https://www.theyworkforyou.com/mp/14075/gil_paterson",
    "https://www.theyworkforyou.com/mp/25111/willie_rennie",
    "https://www.theyworkforyou.com/mp/14085/shona_robison",
    "https://www.theyworkforyou.com/mp/25532/gail_ross",
    "https://www.theyworkforyou.com/mp/25218/alex_rowley",
    "https://www.theyworkforyou.com/mp/14087/mike_rumbles",
    "https://www.theyworkforyou.com/mp/14088/mr_mark_ruskell",
    "https://www.theyworkforyou.com/mp/14089/michael_russell",
    "https://www.theyworkforyou.com/mp/24738/anas_sarwar",
    "https://www.theyworkforyou.com/mp/14091/john_scott",
    "https://www.theyworkforyou.com/mp/25535/graham_simpson",
    "https://www.theyworkforyou.com/mp/14099/elaine_smith",
    "https://www.theyworkforyou.com/mp/14096/elizabeth_smith",
    "https://www.theyworkforyou.com/mp/25536/colin_smyth",
    "https://www.theyworkforyou.com/mp/14100/shirley-anne_somerville",
    "https://www.theyworkforyou.com/mp/14102/stewart_stevenson",
    "https://www.theyworkforyou.com/mp/25538/alexander_stewart",
    "https://www.theyworkforyou.com/mp/14103/david_stewart",
    "https://www.theyworkforyou.com/mp/25114/kevin_stewart",
    "https://www.theyworkforyou.com/mp/14105/nicola_sturgeon",
    "https://www.theyworkforyou.com/mp/10581/john_swinney",
    "https://www.theyworkforyou.com/mp/25540/maree_todd",
    "https://www.theyworkforyou.com/mp/25541/adam_tomkins",
    "https://www.theyworkforyou.com/mp/25115/david_torrance",
    "https://www.theyworkforyou.com/mp/14115/maureen_watt",
    "https://www.theyworkforyou.com/mp/25542/annie_wells",
    "https://www.theyworkforyou.com/mp/25118/paul_wheelhouse",
    "https://www.theyworkforyou.com/mp/14117/sandra_white",
    "https://www.theyworkforyou.com/mp/25543/brian_whittle",
    "https://www.theyworkforyou.com/mp/25544/andy_wightman",
    "https://www.theyworkforyou.com/mp/25775/beatrice_wishart",
    "https://www.theyworkforyou.com/mp/25119/humza_yousaf"
];

async function start() {
    for (var i = 0; i < mspPages.length; i++) {
        await scraper(mspPages[i]);
    }
}

start();