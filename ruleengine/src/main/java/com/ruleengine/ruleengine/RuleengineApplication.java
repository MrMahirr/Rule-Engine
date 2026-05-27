package com.ruleengine.ruleengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class RuleengineApplication {

    public static void main(String[] args) {
        SpringApplication.run(RuleengineApplication.class, args);
    }

}
