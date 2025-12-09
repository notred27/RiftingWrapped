

export default function GenericSearch() {

    return (
        <>
            <select defaultValue="NA1" aria-label="region select" id="regionSelect" >
                <option value="BR1">BR1</option>
                <option value="EUN1">EUN1</option>
                <option value="EUW1">EUW1</option>
                <option value="JP1">JP1</option>
                <option value="KR">KR</option>
                <option value="LA1">LA1</option>
                <option value="LA2">LA2</option>
                <option value="ME1">ME1</option>
                <option value="NA1">NA1</option>
                <option value="OC1">OC1</option>
                <option value="RU">RU</option>
                <option value="SG2">SG2</option>
                <option value="TR1">TR1</option>
                <option value="TW2">TW2</option>
                <option value="VN2">VN2</option>
                <option value="TH2">TH2</option>
                <option value="PH2">PH2</option>
            </select>
            <input
                type="text"
                name="username"
                placeholder="Game Name#Tag"
                autoComplete="on"
                id="nameInput"
            />
        </>
    )
}