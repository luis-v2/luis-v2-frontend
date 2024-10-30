export class Utils {
    public static convertTwoDigitYearToFourDigitWithCurrentYear(year: number) {
        // Nimmt ein zweistelliges Jahr an.
        // Gibt ein vierstelliges Jahr zurück, basierend auf dem aktuellen Jahrhundert.
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        return year + (year > currentYear % 100 ? century - 100 : century);
      }

      public static getDateBlocks(start: Date, end: Date, maxDays: number) {
        let result = [];
        let s = new Date(start);

        if (s >= end) result.push({start: new Date(s), end: new Date(end)}); 
      
        while (s < end) {
          let e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + maxDays);
          result.push({start: new Date(s), end: e <= end? e : new Date(end)});
          s.setDate(s.getDate() + maxDays + 1);
        }
        return result;
      }
}