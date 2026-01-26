import sys
import mimetypes
from email import message_from_bytes


class ReadableEmailBackend:
    def send_messages(self, email_messages):
        for message in email_messages:
            print("\n" + "=" * 70)
            print("📧 EMAIL (разработка)")
            print("=" * 70)
            print(f"To: {', '.join(message.to)}")
            print(f"Subject: {message.subject}")
            print("-" * 70)

            if message.body:
                print(message.body)

            # Выводим HTML версию если есть
            for alt, mimetype in getattr(message, 'alternatives', []):
                if mimetype == 'text/html':
                    print("\nHTML version (preview):")
                    print("-" * 30)
                    # Выводим только начало HTML
                    print(alt[:500] + "..." if len(alt) > 500 else alt)

            print("=" * 70 + "\n")

        return len(email_messages)