import { Metronome } from "./metronome";

// I don't know how to reference p5js types when using p5js instance mode and p5js CDN 😢
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sketchLeft(p: any) {
    p.setup = () => {
        p.createCanvas(200, 100);
    };

    p.draw = () => {
        draw(p, p.conductor.metronomes[0], p.conductor.metronomes[1]);
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sketchRight(p: any) {
    p.setup = () => {
        p.createCanvas(200, 100);
    };

    p.draw = () => {
        draw(p, p.conductor.metronomes[1], p.conductor.metronomes[0]);
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function draw(p: any, metronome: Metronome, otherMetronome: Metronome) {
    const writeAreaX = 1;

    p.clear();

    p.strokeWeight(1);
    p.fill(0);
    // time Line
    p.stroke(0);
    p.line(0 + writeAreaX, p.height / 2, p.width + writeAreaX, p.height / 2);

    if (!p.conductor || p.conductor.metronomes.length <= 0) {
        return;
    }

    const currentTimeX = (metronome.getNowPositionXAtOneBpm() * p.width) + writeAreaX;
    const divisionWidth = p.width / metronome.division;
    const matchDivisionMargin = 5;

    const divisionLineXArray = Array.from(Array(metronome.division).keys())
        .map(divisionIndex => {
            return (divisionWidth * divisionIndex) + writeAreaX
    });

    const isMatch = (standardX: number) => {
        return currentTimeX - matchDivisionMargin <= standardX
            && standardX <= currentTimeX + matchDivisionMargin;
    }

    // write division line
    divisionLineXArray.forEach(divisionLineX => {
        if (isMatch(divisionLineX)) {
            p.strokeWeight(3);
            p.fill(0);
        } else {
            p.strokeWeight(1);
            p.fill(180);
        }
        p.line(divisionLineX, 0, divisionLineX, p.height);
    });

    // circle
    p.strokeWeight(1);
    p.fill(0);
    if (divisionLineXArray.some(divixionLineX => isMatch(divixionLineX))) {
        p.circle(currentTimeX, p.height / 2, 10);
    } else {
        p.circle(currentTimeX, p.height / 2, 5);
    }

    // write sub division line
    const subDivision = getSubDivision(metronome.division, otherMetronome.division);
    if (!subDivision) {
        return;
    }

    Array.from(Array(subDivision).keys())
        .map(subDivisionIndex => {
            return (p.width / subDivision * subDivisionIndex) + writeAreaX
        })
        .forEach(subDivisionLineX => {
            p.strokeWeight(1);
            p.stroke(100, 60)
            p.line(subDivisionLineX, 0 + 20, subDivisionLineX, p.height - 20);
        });
}

function getSubDivision(x: number, y: number): number | null {
    const left = Math.max(x, y);
    const right = Math.min(x, y);
    if (left % right === 0) {
        return null;
    }
    return left * right;
}

