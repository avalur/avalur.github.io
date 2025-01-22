from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.gtts import GTTSService

ts_service = GTTSService(lang="en", tld="com")
# ts_service = AzureService(
#                 voice="en-US-JennyNeural",
#                 style="newcast-casual",
#             )


def finishScene(self):
    self.play(*[FadeOut(mob) for mob in self.mobjects])


class Start(VoiceoverScene):
    def construct(self):
        # Main title
        title = Tex("Advanced Machine Learning")
        title.scale(1.4)
        title.to_edge(UP)

        # Create three images with different rotations and positions
        img1 = ImageMobject("../images/AlphaGoZero.png")
        img2 = ImageMobject("../images/GPT-4-reflexion.png")
        img3 = ImageMobject("../images/LLM_agents_frame.png")

        # Scale images to appropriate size
        img1.scale(1.5)
        img2.scale(1.8)
        img3.scale(1.7)

        # Position and rotate images
        img1.rotate(-15 * DEGREES)
        img1.shift(LEFT * 4 + DOWN)
        img2.rotate(5 * DEGREES)
        img2.shift(DOWN)
        img3.rotate(20 * DEGREES)
        img3.shift(RIGHT * 4 + DOWN)

        self.set_speech_service(ts_service)

        with self.voiceover(
                text="""
                    Are you ready to dive deep into the cutting edge of artificial intelligence? 
                    Our Advanced Machine Learning course takes you beyond the basics, 
                    exploring the technologies that power systems like AlphaGo,
                    overperforming humans in games,
                    ChatGPT, well-known and very popular system by OpenAI, 
                    and the next generation of AI assistants, 
                    which now are called AI Agents.
                    """
        ) as tracker:
            # Animate title and images with different timing
            self.play(
                Write(title),
                run_time=8
            )

            # Fade in images one by one with a slight delay
            self.play(
                FadeIn(img1, shift=UP),
                run_time=8
            )
            self.play(
                FadeIn(img2, shift=UP),
                run_time=4
            )
            self.play(
                FadeIn(img3, shift=UP),
                run_time=4
            )

        self.wait()

        # Fade everything out
        finishScene(self)


class RL(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background image setup
        background = ImageMobject("../images/AI-AlphaStar-StarCraft-II.png")
        # Make the background fill the screen
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        # Center the background
        background.center()
        # Make it semi-transparent
        background.set_opacity(0.3)

        # Main title
        title = Tex("Reinforcement Learning")
        title.scale(1.4)
        title.to_edge(UP)
        # Optional: add background to the title for better readability
        title.set_color_by_gradient(WHITE, BLUE)
        # Or add background box
        title_box = BackgroundRectangle(title, color=BLACK, fill_opacity=0.7)

        with self.voiceover(
                text="""
                Learn how DeepMind created AlphaGo and evolved it
                into AlphaZero:
                - Understand the mathematics behind self-play
                - Study deep reinforcement learning principles
                - Implement Monte Carlo Tree Search in Python
                """
        ) as tracker:
            # First show background with fade
            self.play(
                FadeIn(background),
                run_time=4
            )

            # Then animate the title with its background box
            self.play(
                FadeIn(title_box),
                Write(title),
                run_time=4
            )

            # Create bullet points
            bullets = VGroup(
                Tex("• Mathematics behind self-play"),
                Tex("• Deep reinforcement learning principles"),
                Tex("• Monte Carlo Tree Search implementation")
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.5)
            bullets.next_to(title, DOWN, buff=1)

            # Add background boxes for better readability
            bullet_boxes = VGroup(*[
                BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
                for bullet in bullets
            ])

            # Animate bullets one by one
            for box, bullet in zip(bullet_boxes, bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=2
                )

        self.wait()
        finishScene(self)


class GenerativeAI(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background image setup
        background = ImageMobject("../images/LLM_sizes.png")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Main title
        title = Tex("Generative AI and Large Language Models")
        title.scale(1.4)
        title.to_edge(UP)
        title.set_color_by_gradient(WHITE, PURPLE)  # Changed to purple for a different theme
        title_box = BackgroundRectangle(title, color=BLACK, fill_opacity=0.7)

        with self.voiceover(
                text="""
                Explore the architectures powering modern AI:
                - Variational Autoencoders and GANs
                - Tokenization and embedding techniques
                - Multi-agent systems
                - Build practical solutions for LLM challenges
                """
        ) as tracker:
            # Fade in background
            self.play(
                FadeIn(background),
                run_time=3
            )

            # Animate title
            self.play(
                FadeIn(title_box),
                Write(title),
                run_time=3
            )

            # Create bullet points
            bullets = VGroup(
                Tex("• Variational Autoencoders (VAEs) and GANs"),
                Tex("• Tokenization and embedding techniques"),
                Tex("• Multi-agent systems and AI orchestration"),
                Tex("• Practical solutions for LLM challenges")
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.5)
            bullets.next_to(title, DOWN, buff=1)

            # Add background boxes for better readability
            bullet_boxes = VGroup(*[
                BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
                for bullet in bullets
            ])

            # Animate bullets one by one
            for box, bullet in zip(bullet_boxes, bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=1.5
                )

        self.wait()
        finishScene(self)


class CapstoneProjects(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background image setup
        background = ImageMobject("../images/capstone_background_Grok.jpg")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Main title
        main_title = Tex("Capstone Projects")
        main_title.scale(1.4)
        main_title.to_edge(UP)
        main_title.set_color_by_gradient(WHITE, GREEN)
        main_title_box = BackgroundRectangle(main_title, color=BLACK, fill_opacity=0.7)

        with self.voiceover(
                text="""
                Let's explore two exciting capstone projects that will put your skills to the test.
                First, you'll build your own AlphaZero-like Game AI, and then develop a personal AI assistant.
                """
        ) as tracker:
            # Fade in background and main title
            self.play(
                FadeIn(background),
                FadeIn(main_title_box),
                Write(main_title),
                run_time=6
            )

        # Project 1
        project1_title = Tex("1. Build Your Own Game AI")
        project1_title.scale(0.8)
        project1_title.next_to(main_title, DOWN, buff=0.8)
        project1_title.set_color(BLUE)
        project1_box = BackgroundRectangle(project1_title, color=BLACK, fill_opacity=0.7)

        project1_bullets = VGroup(
            Tex("• Implement self-play mechanisms"),
            Tex("• Design neural network architectures"),
            Tex("• Apply reinforcement learning principles")
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        project1_bullets.scale(0.8)
        project1_bullets.next_to(project1_title, DOWN, buff=0.5)

        # Project 2
        project2_title = Tex("2. Personal voice AI Assistant")
        project2_title.scale(0.8)
        project2_title.next_to(project1_bullets, DOWN, buff=0.8)
        project2_title.set_color(BLUE)
        project2_box = BackgroundRectangle(project2_title, color=BLACK, fill_opacity=0.7)

        project2_bullets = VGroup(
            Tex("• Voice recognition and synthesis"),
            Tex("• LLM integration"),
            Tex("• Performance optimization"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.3)
        project2_bullets.scale(0.8)
        project2_bullets.next_to(project2_title, DOWN, buff=0.5)

        # Add background boxes for better readability
        p1_bullet_boxes = VGroup(*[
            BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
            for bullet in project1_bullets
        ])
        p2_bullet_boxes = VGroup(*[
            BackgroundRectangle(bullet, color=BLACK, fill_opacity=0.7)
            for bullet in project2_bullets
        ])

        with self.voiceover(
                text="""
                The first project challenges you to build an AlphaZero-style AI that masters classic games.
                You'll implement self-play mechanisms, design neural network architectures,
                and apply reinforcement learning principles.
                """
        ) as tracker:
            # Animate Project 1
            self.play(
                FadeIn(project1_box),
                Write(project1_title),
                run_time=4
            )

            # Animate Project 1 bullets
            for box, bullet in zip(p1_bullet_boxes, project1_bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=3
                )

        with self.voiceover(
                text="""
                The second project involves developing your own personal voice AI assistant.
                You'll work on voice recognition and synthesis, LLM integration,
                performance optimization, and system architecture design.
                """
        ) as tracker:
            # Animate Project 2
            self.play(
                FadeIn(project2_box),
                Write(project2_title),
                run_time=4
            )

            # Animate Project 2 bullets
            for box, bullet in zip(p2_bullet_boxes, project2_bullets):
                self.play(
                    FadeIn(box),
                    Write(bullet),
                    run_time=3
                )

        self.wait()
        finishScene(self)


class FinalScene(VoiceoverScene):
    def construct(self, FRAME_HEIGHT=config.frame_height, FRAME_WIDTH=config.frame_width):
        self.set_speech_service(ts_service)

        # Background setup with a gradient effect
        background = ImageMobject("../images/Wall-E-from-Grok.jpg")
        background.scale_to_fit_height(FRAME_HEIGHT)
        background.scale_to_fit_width(FRAME_WIDTH)
        background.center()
        background.set_opacity(0.3)

        # Create the main message text, split into parts for dramatic effect
        message_part1 = Text(
            "Join us to master the technologies shaping our future.",
            font_size=40
        )

        message_part2 = Text(
            "Whether you're aiming to innovate in AI research\nor build practical applications with it.",
            font_size=36
        )

        message_part3 = Text(
            "This course provides the advanced skills you need to succeed.",
            font_size=40
        )

        # Arrange the text parts vertically
        message_group = VGroup(
            message_part1,
            message_part2,
            message_part3
        ).arrange(DOWN, buff=0.8)

        # Center the entire text group
        message_group.center()

        # Add gradient colors to make it visually appealing
        message_part1.set_color_by_gradient(BLUE, WHITE)
        message_part2.set_color(WHITE)
        message_part3.set_color_by_gradient(WHITE, BLUE)

        # Create background boxes for better readability
        boxes = VGroup(*[
            BackgroundRectangle(text, color=BLACK, fill_opacity=0.7)
            for text in [message_part1, message_part2, message_part3]
        ])

        with self.voiceover(
                text="""
                Join us to master the technologies shaping our future. 
                Whether you're aiming to innovate in AI research or 
                build practical applications with it, 
                this course provides the advanced skills you need to succeed.
                """
        ) as tracker:
            # Fade in the background with a slight zoom effect
            self.play(
                FadeIn(background),
                run_time=2
            )

            # Animate each part of the message sequentially
            # Part 1
            self.play(
                FadeIn(boxes[0]),
                Write(message_part1),
                run_time=2
            )

            # Part 2
            self.play(
                FadeIn(boxes[1]),
                Write(message_part2),
                run_time=6
            )

            # Part 3 with a special emphasis
            self.play(
                FadeIn(boxes[2]),
                Write(message_part3),
                run_time=2
            )

            # Add a subtle pulsing effect to emphasize the final message
            self.play(
                *[
                    box.animate.scale(1.05).set_opacity(0.8)
                    for box in boxes
                ],
                *[
                    text.animate.scale(1.05)
                    for text in [message_part1, message_part2, message_part3]
                ],
                run_time=1
            )

            self.play(
                *[
                    box.animate.scale(1 / 1.05).set_opacity(0.7)
                    for box in boxes
                ],
                *[
                    text.animate.scale(1 / 1.05)
                    for text in [message_part1, message_part2, message_part3]
                ],
                run_time=1
            )

        # Hold the final frame for a moment
        self.wait(2)
        finishScene(self)


class Full(VoiceoverScene):
    def construct(self):
        Start.construct(self)
        RL.construct(self)
        GenerativeAI.construct(self)
        CapstoneProjects.construct(self)
        FinalScene.construct(self)
