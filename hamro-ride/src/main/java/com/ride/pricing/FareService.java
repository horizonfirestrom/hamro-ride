package com.ride.pricing;

import org.springframework.stereotype.Service;

@Service
public class FareService {

    private final PricingProperties props;

    public FareService(PricingProperties props) {
        this.props = props;
    }

    public static double distanceMiles(double lat1, double lng1, double lat2, double lng2) {
        double R = 3958.8; // Earth radius in miles
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(Math.toRadians(lat1)) *
                        Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public double estimateFare(double distanceMiles) {
        double fare = props.getBaseFare() + (distanceMiles * props.getPerMile());
        return Math.max(fare, props.getMinimumFare());
    }
}
