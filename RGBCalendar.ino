#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

#define SSID    "SSID"                    // Modify to your WiFi's name
#define PSWD    ""                        // Modify to your WiFi's password
#define SERVER  "xxx.xxx.xxx.xxxx:8080"   // Modify to your server's IP
#define TOKEN   ""                        // Modify to your generated token
 
void connectToWiFi(const char *ssid, const char *password)
{
  WiFi.begin(ssid, password);
   
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting..");
  }
}

void setup ()
{ 
  Serial.begin(115200);
  connectToWiFi(SSID, PSWD);
}
void loop() {
  if (WiFi.status() != WL_CONNECTED)
    connectToWiFi(SSID, PSWD);
  if (WiFi.status() == WL_CONNECTED)
    Serial.println("Connected");
  delay(1000);
}
