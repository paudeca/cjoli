import { ToastControl } from "@/components/CurrentToast";
//import { ExternalLink } from "@tamagui/lucide-icons";
import {
  Anchor,
  Avatar,
  H2,
  H4,
  ListItem,
  Paragraph,
  ScrollView,
  SizableText,
  Text,
  XStack,
  YGroup,
  YStack,
} from "tamagui";

export default function TabOneScreen() {
  return (
    <ScrollView>
      <YStack flex={1} items="center" gap="$8" px="$5" py="$5" bg="$background">
        <YGroup bordered>
          <YGroup.Item>
            <ListItem bg="$background0">
              <XStack>
                <SizableText size="$8">1</SizableText>
                <YStack>
                  <XStack>
                    <Avatar circular>
                      <Avatar.Image
                        accessibilityLabel="Cam"
                        src="https://upload.wikimedia.org/wikipedia/fr/a/a7/Lions_de_Wasquehal.png"
                      />
                      <Avatar.Fallback backgroundColor="$blue10" />
                    </Avatar>

                    <Text mx="$2">Wasquehal</Text>
                  </XStack>
                  <XStack bg="red" width={240}>
                    <Text>1</Text>
                    <Text>2</Text>
                  </XStack>
                </YStack>
                <SizableText size="$8">1</SizableText>
              </XStack>
            </ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Moon</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem hoverTheme>Sun</ListItem>
          </YGroup.Item>
          <YGroup.Item>
            <ListItem>Cloud</ListItem>
          </YGroup.Item>
        </YGroup>

        {/*<H2>Tamagui + Expo</H2>

        <ToastControl />

        <XStack
          items="center"
          justify="center"
          flexWrap="wrap"
          gap="$1.5"
          position="absolute"
          b="$8"
        >
          <Paragraph fontSize="$5">Add</Paragraph>

          <Paragraph fontSize="$5" px="$2" py="$1" color="$blue10" bg="$blue5">
            tamagui.config.ts
          </Paragraph>

          <Paragraph fontSize="$5">to root and follow the</Paragraph>

          <XStack
            items="center"
            gap="$1.5"
            px="$2"
            py="$1"
            rounded="$3"
            bg="$green5"
            hoverStyle={{ bg: "$green6" }}
            pressStyle={{ bg: "$green4" }}
          >
            <Anchor
              href="https://tamagui.dev/docs/core/configuration"
              textDecorationLine="none"
              color="$green10"
              fontSize="$5"
            >
              Configuration guide
            </Anchor>
          </XStack>

          <Paragraph fontSize="$5" text="center">
            to configure your themes and tokens.
          </Paragraph>
        </XStack>*/}
      </YStack>
    </ScrollView>
  );
}
