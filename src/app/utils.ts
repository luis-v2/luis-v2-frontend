export class Utils {
    public static convertTwoDigitYearToFourDigitWithCurrentYear(year: number) {
        // Nimmt ein zweistelliges Jahr an.
        // Gibt ein vierstelliges Jahr zurück, basierend auf dem aktuellen Jahrhundert.
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        return year + (year > currentYear % 100 ? century - 100 : century);
      }
}