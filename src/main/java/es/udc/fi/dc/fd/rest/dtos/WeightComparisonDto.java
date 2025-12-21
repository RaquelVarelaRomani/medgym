package es.udc.fi.dc.fd.rest.dtos;

public class WeightComparisonDto {

    private Long totalWeightKg;
    private String comparisonPhrase;

    public WeightComparisonDto() {
    }

    public WeightComparisonDto(Long totalWeightKg, String comparisonPhrase) {
        this.totalWeightKg = totalWeightKg;
        this.comparisonPhrase = comparisonPhrase;
    }

    public Long getTotalWeightKg() {
        return totalWeightKg;
    }

    public void setTotalWeightKg(Long totalWeightKg) {
        this.totalWeightKg = totalWeightKg;
    }

    public String getComparisonPhrase() {
        return comparisonPhrase;
    }

    public void setComparisonPhrase(String comparisonPhrase) {
        this.comparisonPhrase = comparisonPhrase;
    }
}
