package es.udc.fi.dc.fd.rest.dtos;

public class BodyMetricsParamsDto {

    private Double weightKg;
    private Double heightCm;
    private String gender;

    public BodyMetricsParamsDto() {}

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

    public String getGender() { 
        return gender; 
    }
    public void setGender(String gender) { 
        this.gender = gender; 
    }
}
