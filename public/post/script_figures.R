

#2018-06
#https://ecdc.europa.eu/en/surveillance-atlas-infectious-diseases

measles <- data.frame(vacc_status=c("Unvaccinated","1 Dose",">= 2 Dose","Unkown Dose","Unkown"),
                      rel=c(0.75,0.091,0.05,0.012,0.096))

library(ggplot2)
library(scales)

blank_theme <- theme_minimal()+
  theme(
    axis.title.x = element_blank(),
    axis.title.y = element_blank(),
    panel.border = element_blank(),
    panel.grid=element_blank(),
    axis.ticks = element_blank(),
    plot.title=element_text(size=14, face="bold"),
    axis.text=element_blank()
  )

ggplot(measles,
       aes(factor(1),rel,fill=vacc_status))+
          geom_bar(stat="identity",width = 1)+
            scale_y_continuous(breaks=seq(0,1,.1),labels=percent)+
              blank_theme+coord_polar("y", start=0)+
               ggtitle("ECDC Surveillance for Europe Measles 2018-06")+
               scale_fill_brewer("Measles\nVaccination Status",palette = "Set1")

ggsave("vaccination_pie.png")


ggplot(measles,aes(vacc_status,rel))+geom_bar(stat="identity")+
  scale_y_continuous(breaks=seq(0,1,.1),labels=percent,limits=c(0,1))+
  labs(x="",y="")+
  theme_minimal()

ggsave("vacc_barplot.png")



theme_singlebar <- theme_bw()+
  theme(
    legend.position = "bottom",
    axis.title = element_blank(),
    axis.ticks.y = element_blank(),
    axis.text.y = element_blank(),
    panel.border = element_blank(),
    panel.grid=element_blank(),
    plot.title=element_text(size=14, face="bold")
  )


ggplot(measles,aes(1,rel,fill=vacc_status))+geom_bar(stat="identity")+
  scale_y_continuous(breaks=seq(0,1,.1),
                     labels=percent,
                     limits=c(0,1),
                     expand=c(.01,.01))+
  scale_x_continuous(expand=c(0,0))+
              coord_flip()+
                scale_fill_brewer("",palette="Set1")+
                  theme_singlebar

ggsave("vacc_bar_h.png")

