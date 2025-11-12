package es.udc.fi.dc.fd.rest.dtos;

public class BmiDto {
    private Double bmi;

    public BmiDto() {}
    public BmiDto(Double bmi) { 
        this.bmi = bmi; 
    }

    public Double getBmi() { 
        return bmi; 
    }
    public void setBmi(Double bmi) { 
        this.bmi = bmi; 
    }
}

