---
tags:
  - public
---

This is the first version

![Pasted image 20260521124634](/attachments/pasted-image-20260521124634.png)

And it does not at all feel right, why?

Font feels wrong. Font-size also feels weird.

After changing the font and on reducing the size of description it looks like this -
also changed the book image's size, so that the card as a smaller empty space.

![Pasted image 20260521132307](/attachments/pasted-image-20260521132307.png)

Now I think, the H2 heading is too much contrast (It's screaming too much attention). Lets dial down its colour strength.

And lets add a library icon.

![Pasted image 20260521133240](/attachments/pasted-image-20260521133240.png)

Feels better, but still not right.

I feel like the issue now is that, the text in the book card is mixing with the surrounding. There needs to be a slight distinction.

I tried to make the bg a bit darker (black/5) but it did not feel right. So, Let's just make the background a different colour (I saw this in Emil Kowalski's website) and add a inner shadow.

![Pasted image 20260521134530](/attachments/pasted-image-20260521134530.png)

Again, this is much better.

Changed the font once again and added an hover effect.

[Screen Recording 2026-05-21 at 2.53.39 PM](/attachments/screen-recording-2026-05-21-at-2.53.39-pm.mov)
and now with the drag to reorder
also removed the rotation on hover (feels a bit of un-natural) and added rotation while dragging (feels natural => good).

[Screen Recording 2026-05-22 at 6.05.51 PM](/attachments/screen-recording-2026-05-22-at-6.05.51-pm.mov)

Let's just remove the hover effect, it is meant to be like a book being lifted on hover but It's too much motion and I think it's unnecessary. 

During the implementation of the drag feature and delete feature - 
Stuff went bad
1. I started coding the implementation before any planning, so It was like - I want to add something, instead of carefully looking at what is present and then adding stuff accordingly. I just kept on adding stuff and then checked if this works. This works but, as the features get complex and complex, this gets worse and worse.
2. Some typescript stuff (not all), I just ignored instead of handling properly

