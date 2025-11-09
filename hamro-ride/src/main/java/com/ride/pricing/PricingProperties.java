package com.ride.pricing;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "pricing")
public class PricingProperties {

    private double baseFare = 2.0;
    private double perMile = 1.25;
    private double minimumFare = 5.0;

    public double getBaseFare() { return baseFare; }
    public void setBaseFare(double baseFare) { this.baseFare = baseFare; }

    public double getPerMile() { return perMile; }
    public void setPerMile(double perMile) { this.perMile = perMile; }

    public double getMinimumFare() { return minimumFare; }
    public void setMinimumFare(double minimumFare) { this.minimumFare = minimumFare; }
}
