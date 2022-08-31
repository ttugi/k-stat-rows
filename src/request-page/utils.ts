import { statPage } from "./kstatTypes";

export function generateCsvRow(data: statPage): string[] {
    const row = data.SHEET.DATA.TR.map(r => {
        return `${r.TD[0]},${r.TD[1]},${r.TD[3]},${r.TD[5]},${r.TD[6]},${r.TD[7]},${r.TD[8]},${r.TD[9]},${r.TD[10]},${r.TD[11]},${r.TD[12]},${r.TD[13]},${r.TD[14]}\n`
        })
    return row
}