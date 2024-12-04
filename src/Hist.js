

export default function Hist({ data, numBins, labels, style}){

    const binWidth = (Math.max(...data) - Math.min(...data))/ numBins
    // console.log(binWidth)

    const dmin =  Math.min(...data)
    let sorted = []
    for(let i = 0; i < numBins; i++) {
        sorted[i] = 0
    }

    for(let i = 0; i < data.length; i++) {
// fixme: edit so the min and max range matter here?
        let bin = Math.floor((data[i] -  dmin)/ binWidth)
        if(bin === numBins) {   // Ensure the edge doesn't round up
            bin -= 1
        }
        sorted[bin] += 1
    }

    const hmax = Math.max(...sorted)
    // console.log(sorted)


    return (
        <div style={{width:"300px"}}>

        
            <div style={{display:"grid", gridTemplateColumns:`repeat(${numBins}, 1fr)`, alignItems:"end",columnGap:"8px" ,width:"100%", height:"150px"}}>
                
                {sorted.map(val => {
                    const percent = val / hmax * 100

                    return <span style={{backgroundColor:"#ff0000", borderRadius:"5px", height:`${percent}%`}}></span>
                })}
                

            </div>

            <div style={{display:"grid", gridTemplateColumns:`repeat(${numBins}, 1fr)`, justifyItems:"center", alignItems:"center",columnGap:"8px" ,width:"100%", height:"30px"}}>
                        
            {sorted.map((val, idx) => {
   
                // console.log((idx + 1)  * binWidth)
                return <span style={{rotate:"20deg"}}> {Math.round((idx * binWidth + (idx + 1) * binWidth) / 2 * 10)/10}</span>
            })}


            </div>
        </div>
    )

}