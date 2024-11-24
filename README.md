# Image resizer for posting on instagram

Super simple image resizer that adds borders to images for instagram. It's
custom built around the maximum image dimensions allowed on instagram, 1080 x
1350. Since I've taken up photography as a hobby I've constantly been annoyed by
the fact that it forces you to post in 4x5 or one of their other weird
dimensions, with even smaller dimensions. If you wanna post several images with
different aspect ratios, in their original aspect ratio, you need to find a
common denominator (1080 x 1350 being the largest possible) and then add borders
around your image. This little frontend automates that task and allows you to do
that somewhat efficiently.

It's neither very performant (could be optimized a lot), nor particularly well
written but it gets the job done. It's based on the awesome
[vitesse-lite](https://github.com/antfu-collective/vitesse-lite) by antfu and
was hacked together in like 30 minutes...
