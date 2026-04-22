const meta = {
  gold: {
    richest: 1,
    poorest: -2,
    affect: true,
  },
  settlements: {
	  score: 1,
	  initial: 1,
	  max: [1, 2, 3, 4, 5]
  },
  cities: {
	  score: 2,
	  initial: 1,
	  max: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  harbors: {
    threshold: 3,
    score: 2,
    affect: true,
	max: [1, 2, 3, 4, 5]
  },
  roads: {
    threshold: 5,
    score: 2,
    affect: true,
  },
  knights: {
    threshold: 5,
    score: 2,
    affect: true,
	max: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  fish: {
    score: 1,
    limit: 8,
	max: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  spices: {
    score:  (numSpices) => {
		switch (numSpices) {
		case 1: return 1;
		case 2: return 2;
		case 3: return 3;
		case 4: return 5;
		case 5: return 8;
		case 6: return 13;
		default: return 0;
		}
	},
	max: [1, 2, 3, 4, 5, 6]
  },
  pirates: {
	score: (numPirates) => {
		switch (numPirates) {
		case 1: return 1;
		case 2: return 4;
		case 3: return 8;
		case 4: return 14;
		default: return 0;
		}
	},
	max: [1, 2, 3, 4]
  },
  trade: {
    threshold: 4,
    score: 2,
    affect: true,
	max:[1, 2, 3, 4, 5]
  },
  politics: {
    threshold: 4,
    score: 2,
    affect: true,
	max: [1, 2, 3, 4, 5]
  },
  science: {
    threshold: 4,
    score: 2,
    affect: true,
	max: [1, 2, 3, 4, 5]
  },
  defenders: 1,
  merchant: {
    score: 1,
    affect: true,
  },
  constitution: {
    score: 1,
  },
  printer: {
    score: 1,
  },
  boot: 1,
};

export default meta;
