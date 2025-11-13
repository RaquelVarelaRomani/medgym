package es.udc.fi.dc.fd.rest.dtos;

public class BmiCalculateParamsDto {

    private Double weightKg;
    private Double heightCm;

    public BmiCalculateParamsDto() {}

    public Double getWeightKg() { 
        return weightKg; 
    }
    public void setWeightKg(Double weightKg) { 
        this.weightKg = weightKg; 
    }

    public Double getHeightCm() { 
        return heightCm; 
    }
    public void setHeightCm(Double heightCm) { 
        this.heightCm = heightCm; 
    }
}
