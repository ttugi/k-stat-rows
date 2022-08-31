import axios from "axios"
import { XMLParser } from "fast-xml-parser"
import FileSaver from "file-saver"
import qs from "qs"
import { useCallback, useEffect, useState } from "react"
import { statPage } from "./kstatTypes"
import { fixData } from "./staticData"
import { generateCsvRow } from "./utils"

function RequestPage() {
    const querySize = 100
    const [year, setYear] = useState<string>('2022')
    const [month, setMonth] = useState<string>('07')
    const [firstPage, setFirstPage] = useState<statPage>()
    const [total, setTotal] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(0)
    const [csvRows, setCsvRows] = useState<string[]>([])

    const handleFirstRequest = useCallback(() => {
        if (loading) {
            return
        }
        setLoading(true)
        setCurrentPage(1)
        axios.post(
            '/stat/kts/ctr/CtrItemImpExpListWorker.screen',
            qs.stringify({
                ...fixData,
                pageNum: 1,
                s_year: year,
                s_month: month
            }),
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                withCredentials: true
            }
        ).then((data) => {
            // console.log(data.data)
            const parser = new XMLParser();
            const jsonData: statPage = parser.parse(data.data);
            if (!jsonData || !jsonData.SHEET["ETC-DATA"]?.ETC) {
                alert('error')
                return
            }
            setCsvRows(prev => [...prev, ...generateCsvRow(jsonData)])
            setFirstPage(jsonData)
            setTotal(jsonData.SHEET["ETC-DATA"].ETC)
        }).catch(r => {
            setCsvRows([])
            setLoading(false)
            alert('Fail first loading page')
        })
    }, [month, year, loading])

    useEffect(() => {
        if (!total || !firstPage) {
            return
        }
        async function fetchPage(page: number) {
            const { data } = await axios.post(
                '/stat/kts/ctr/CtrItemImpExpListWorker.screen',
                qs.stringify({
                    ...fixData,
                    s_year: year,
                    s_month: month,
                    pageNum: page
                }),
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                    },
                    withCredentials: true
                }
            )
            const parser = new XMLParser();
            const jsonData: statPage = parser.parse(data);
            console.log('row', page, jsonData.SHEET.DATA.TR)
            setCsvRows(prev => [...prev, ...generateCsvRow(jsonData)])
        }

        async function asdf() {
            for (let i = 2; i * querySize < 301; i++) {
                setCurrentPage(i)
                await fetchPage(i)
                console.log('next page', i)
            }

            setLoading(false)
        }
        asdf().catch(r => {
            alert('fetch page error!' + r)
            setLoading(false)
        })

    }, [firstPage, total, year, month])

    useEffect(() => {
        if (loading || csvRows.length < 1) {
            return
        }
        const blob = new Blob(csvRows, { type: 'text/plain;charset=utf-8' })
        setCsvRows([])
        FileSaver.saveAs(blob, `${Number(year) - 1}-${year}-stats.csv`)
    }, [csvRows, loading, year])

    return (
        <div>
            <input placeholder="4자리 year" value={year} onChange={v => setYear(v.target.value)}/>
            <input placeholder="2자리 month" value={month} onChange={v => setMonth(v.target.value)}/>
            <button onClick={handleFirstRequest}>
                request!
            </button>
            <div>
                {
                    loading && <div>loading... {currentPage * querySize} / {total}</div>
                }
            </div>
        </div>
    )
}

export default RequestPage